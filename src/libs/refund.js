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
            const partnerCode = process.env.MOMO_PARTNER_CODE;
            const secretKey = process.env.MOMO_SECRET_KEY;
            const requestId = `${_id}_refund_${Date.now()}`;
            const rawSignature = `accessKey=${process.env.MOMO_ACCESS_KEY}&amount=${totalOrder}&description=&orderId=${_id}&partnerCode=${partnerCode}&requestId=${requestId}&transId=${paymentRef.momoTransId}`;
            const signature = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");

            const res = await fetch("https://test-payment.momo.vn/v2/gateway/api/refund", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    partnerCode, orderId: _id.toString(), requestId,
                    amount: totalOrder, transId: Number(paymentRef.momoTransId),
                    lang: "vi", description: "", signature,
                }),
            });
            const data = await res.json();
            if (data.resultCode !== 0) throw new Error(data.message || "MoMo refund lỗi");
            return true;
        }

        case "zalopay": {
            if (!paymentRef?.zaloTransId) throw new Error("Thiếu zp_trans_id để refund ZaloPay");
            const app_id = Number(process.env.ZALOPAY_APP_ID);
            const key1 = process.env.ZALOPAY_KEY1;
            const m_refund_id = `${moment().format("YYMMDD")}_${app_id}_${Date.now()}`;
            const timestamp = Date.now();
            const description = "Pizza Teo refund toàn phần";
            // ⚠️ CHƯA verify field order với doc thật của ZaloPay refund API — test kỹ trước khi dùng,
            // giống lúc trước mình từng debug lại HMAC create API.
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
            if (data.return_code !== 1) throw new Error(data.return_message || "ZaloPay refund lỗi");
            return true;
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