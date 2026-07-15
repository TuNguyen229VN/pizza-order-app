import crypto from "crypto";
import moment from "moment";

export async function refundOrder(order) {
    const { paymentMethod, paymentRef, totalOrder, _id } = order;

    switch (paymentMethod) {
        case "stripe": {
            if (!paymentRef?.stripePaymentIntentId) throw new Error("Thiếu payment_intent để refund Stripe");
            const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
            await stripe.refunds.create({ payment_intent: paymentRef.stripePaymentIntentId });
            return true;
        }

        case "momo": {
            if (!paymentRef?.momoTransId) throw new Error("Thiếu transId để refund MoMo");

            // Idempotency guard — tránh gọi lại nếu đã xử lý
            if (order.refundStatus === "success") return true;

            const partnerCode = process.env.MOMO_PARTNER_CODE;
            const secretKey = process.env.MOMO_SECRET_KEY;

            // Dùng chung 1 giá trị unique cho cả orderId và requestId của lần refund này
            const refundId = paymentRef.momoRefundId || `${_id}_refund_${Date.now()}`;

            const rawSignature = `accessKey=${process.env.MOMO_ACCESS_KEY}&amount=${totalOrder}&description=&orderId=${refundId}&partnerCode=${partnerCode}&requestId=${refundId}&transId=${paymentRef.momoTransId}`;
            const signature = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");

            const res = await fetch("https://test-payment.momo.vn/v2/gateway/api/refund", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    partnerCode, orderId: refundId, requestId: refundId,
                    amount: totalOrder, transId: Number(paymentRef.momoTransId),
                    lang: "vi", description: "", signature,
                }),
            });
            const data = await res.json();

            // Lưu lại refundId đã dùng để lần sau (nếu retry) tái sử dụng thay vì sinh mới
            order.paymentRef.momoRefundId = refundId;

            if (data.resultCode === 0) {
                order.refundStatus = "success";
                await order.save();
                return true;
            }

            // resultCode 1005 (ví dụ) = đang xử lý trùng request — coi là pending, không throw cứng
            if (data.resultCode === 1005 || (data.message || "").toLowerCase().includes("trùng")) {
                order.refundStatus = "pending";
                await order.save();
                return true;
            }

            order.refundStatus = "failed";
            await order.save();
            throw new Error(data.message || "MoMo refund lỗi");
        }

        case "zalopay": {
            if (!paymentRef?.zaloTransId) throw new Error("Thiếu zp_trans_id để refund ZaloPay");

            if (order.refundStatus === "success") return true;

            // Nếu đang pending và đã có refund request trước đó -> query trạng thái thật
            // thay vì chặn cứng hoặc gọi refund mới
            if (order.refundStatus === "pending" && paymentRef.zaloRefundId) {
                const status = await queryZaloRefundStatus(paymentRef.zaloRefundId, paymentRef.zaloTransId);
                if (status === "success") {
                    order.refundStatus = "success";
                    await order.save();
                    return true;
                }
                if (status === "pending") {
                    // vẫn đang xử lý, coi như ok để không chặn cancel
                    return true;
                }
                // status === "failed" -> rơi xuống dưới để tạo refund request mới
            }

            const app_id = Number(process.env.ZALOPAY_APP_ID);
            const key1 = process.env.ZALOPAY_KEY1;
            const m_refund_id = `${moment().format("YYMMDD")}_${app_id}_${Date.now()}`;
            const timestamp = Date.now();
            const description = "Pizza Teo refund toàn phần";
            const hmac_input = `${app_id}|${paymentRef.zaloTransId}|${totalOrder}|${description}|${timestamp}`;
            const mac = crypto.createHmac("sha256", key1).update(hmac_input).digest("hex");

            const res = await fetch("https://sb-openapi.zalopay.vn/v2/refund", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    app_id, m_refund_id, zp_trans_id: paymentRef.zaloTransId,
                    amount: totalOrder, timestamp, description, mac,
                }),
            });
            const data = await res.json();
            const msg = data.return_message || data.sub_return_message || "";

            if (data.return_code === 1) {
                order.refundStatus = "success";
                order.paymentRef.zaloRefundId = m_refund_id;
                await order.save();
                return true;
            }

            if (data.return_code === 2) {
                order.refundStatus = "pending";
                order.paymentRef.zaloRefundId = m_refund_id;
                await order.save();
                return true;
            }

            // ZaloPay báo đã có 1 refund khác đang chạy cho giao dịch này (do lần trước
            // gọi thành công phía ZaloPay nhưng order.save() không kịp lưu pending)
            if (msg.includes("đang refund") || msg.toLowerCase().includes("in progress")) {
                order.refundStatus = "pending";
                await order.save();
                return true;
            }

            order.refundStatus = "failed";
            await order.save();
            throw new Error(msg || "ZaloPay refund lỗi");
        }
        case "paypal": {
            if (!paymentRef?.paypalCaptureId) throw new Error("Thiếu capture_id để refund PayPal");
            const basicAuth = Buffer.from(
                `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
            ).toString("base64");
            const res = await fetch(
                `https://api-m.sandbox.paypal.com/v2/payments/captures/${paymentRef.paypalCaptureId}/refund`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Basic ${basicAuth}` },
                    body: JSON.stringify({}),
                }
            );
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "PayPal refund lỗi");
            }
            return true;
        }

        case "cod":
            return true; // chưa thu tiền, không cần gọi API gì

        default:
            throw new Error("Phương thức thanh toán không hợp lệ để refund");
    }
}

export async function queryZaloRefundStatus(m_refund_id, zp_trans_id) {
    const app_id = Number(process.env.ZALOPAY_APP_ID);
    const key1 = process.env.ZALOPAY_KEY1;
    const timestamp = Date.now();
    const hmac_input = `${app_id}|${m_refund_id}|${timestamp}`;
    const mac = crypto.createHmac("sha256", key1).update(hmac_input).digest("hex");

    const res = await fetch("https://sb-openapi.zalopay.vn/v2/query_refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ app_id, m_refund_id, timestamp, mac }),
    });
    const data = await res.json();

    // 1 = thành công, 2 = đang xử lý, khác = thất bại
    if (data.return_code === 1) return "success";
    if (data.return_code === 2) return "pending";
    return "failed";
}