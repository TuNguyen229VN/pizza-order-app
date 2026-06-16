import { connectDB } from "@/libs/connectDB";
import { Order } from "@/models/Order";
import { MenuItem } from "@/models/MenuItem";
import { validateForm, validators } from "@/libs/validators";
import { calcDeliveryInfo } from "@/utils/utils";
import { ComboDetail } from "@/models/ComboDetail";
import { sendNotification } from "@/libs/sendNotification";
import { pusherServer } from "@/libs/pusherServer";
import { EXCHANGE_RATE_VIETNAM, MIN_DELIVERY_AMOUNT } from "@/constant/constant";
import crypto from "crypto";
import moment from "moment";
import { UserInfo } from "@/models/UserInfo";
import { calcPointDiscount } from "@/libs/pointTier";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// ─── Helper tính tổng tiền ───────────────────────────────────────────────────
function calcTotal(cartProducts) {
    return cartProducts.reduce((sum, p) => sum + Math.round(p.price) * (p.quantity || 1), 0);
}

// ─── Helper trigger noti COD ─────────────────────────────────────────────────
async function triggerOrderNotification(orderDoc) {
    const [userNotif, adminNotif] = await Promise.all([
        sendNotification({
            type: "order_placed",
            recipientRole: "user",
            recipientEmail: orderDoc.userEmail,
            orderId: orderDoc._id,
            title: "Đặt hàng thành công 🎉",
            message: `Đơn hàng [${orderDoc._id}] của bạn đã được đặt! Vui lòng thanh toán khi nhận hàng (COD).`,
        }),
        sendNotification({
            type: "order_placed",
            recipientRole: "admin",
            orderId: orderDoc._id,
            title: "Đơn hàng mới (COD)!",
            message: `Khách ${orderDoc.userName} (${orderDoc.phone}) vừa đặt đơn [${orderDoc._id}] - COD. Chưa thanh toán, chờ giao hàng.`,
        }),
    ]);
    await Promise.all([
        pusherServer.trigger(
            `private-user-${orderDoc.userEmail.replace(/[@.]/g, "-")}`,
            "new-notification",
            { notification: userNotif }
        ),
        pusherServer.trigger("private-admin", "new-notification", { notification: adminNotif }),
    ]);
}

export async function POST(req) {
    try {
        await connectDB();
        const { cartProducts, infoProfileCheckout, deliveryInfo, noteDelivery, paymentMethod } = await req.json();

        if (!deliveryInfo) {
            return Response.json({ message: "Vui lòng nhập địa chỉ để giao hàng hoặc mua mang về" }, { status: 400 });
        }
        if (deliveryInfo.mode === "delivery" && calcTotal(cartProducts) < MIN_DELIVERY_AMOUNT) {
            return Response.json({ message: `Đơn giao hàng tối thiểu ${MIN_DELIVERY_AMOUNT.toLocaleString("vi-VN")}đ` }, { status: 400 });
        }
        const { isValid, errors } = validateForm({
            name: { value: infoProfileCheckout.name, rules: [validators.required("họ và tên"), validators.minLength(2), validators.maxLength(200)] },
            email: { value: infoProfileCheckout.email, rules: [validators.required("email"), validators.email] },
            phone: { value: infoProfileCheckout.phone, rules: [validators.required("số điện thoại"), validators.phone] },
            noteDelivery: { value: noteDelivery, rules: [validators.maxLength(200)] },
            paymentMethod: { value: paymentMethod, rules: [validators.required("phương thức thanh toán")] },
        });
        if (!isValid) return Response.json({ message: "Dữ liệu không hợp lệ", errors }, { status: 400 });

        let shipFee = 0;
        if (deliveryInfo.mode === "delivery") {
            if (!deliveryInfo.lat || !deliveryInfo.lng)
                return Response.json({ message: "Thiếu tọa độ giao hàng" }, { status: 400 });
            const serverDeliveryInfo = calcDeliveryInfo(deliveryInfo.lat, deliveryInfo.lng);
            if (!serverDeliveryInfo?.canDeliver)
                return Response.json({ message: "Địa chỉ ngoài vùng giao hàng" }, { status: 400 });
            shipFee = serverDeliveryInfo.fee;
        }

        // ─── Validate toàn bộ cart (dùng chung cho mọi payment method) ──────
        const lineItems = []; // { name, quantity, unitAmount }
        for (const cartProduct of cartProducts) {
            if (cartProduct.type === "combo") {
                const comboInfo = await ComboDetail.findById(cartProduct._id);
                if (!comboInfo) return Response.json({ message: `Combo "${cartProduct?.name || ""}" không tồn tại` }, { status: 400 });
                if (comboInfo.status !== "on") return Response.json({ message: `Combo "${cartProduct?.name || ""}" không còn bán` }, { status: 400 });
                const quantity = cartProduct.quantity;
                if (!Number.isInteger(quantity) || quantity < 1) return Response.json({ message: `Số lượng trong "${cartProduct?.name || ""}" không hợp lệ` }, { status: 400 });

                const selectedItems = cartProduct.slots || [];
                for (const selected of selectedItems) {
                    const slotIdx = selected.slotIndex;
                    const slot = comboInfo.slots[slotIdx];
                    if (!slot) return Response.json({ message: `Combo "${cartProduct?.name || ""}": slot index ${slotIdx} không hợp lệ` }, { status: 400 });
                    const menuItemInfo = await MenuItem.findById(selected.menuItem?._id || selected.menuItem);
                    if (!menuItemInfo) return Response.json({ message: `Combo "${cartProduct?.name || ""}": món không tồn tại` }, { status: 400 });
                    if (menuItemInfo.status !== "on") return Response.json({ message: `Combo "${cartProduct?.name || ""}": món "${menuItemInfo.name}" không còn bán` }, { status: 400 });
                    if (menuItemInfo.category.toString() !== slot.category._id?.toString()) return Response.json({ message: `Combo "${cartProduct?.name || ""}": món "${menuItemInfo.name}" không thuộc danh mục của slot ${slotIdx + 1}` }, { status: 400 });
                    if (slot.allowedItems?.length > 0) {
                        const allowed = slot.allowedItems.map((id) => id?._id?.toString() || id.toString());
                        if (!allowed.includes(menuItemInfo._id.toString())) return Response.json({ message: `Combo "${cartProduct?.name || ""}": món "${menuItemInfo.name}" không được phép chọn trong slot ${slotIdx + 1}` }, { status: 400 });
                    }
                    if (slot.size?.name) {
                        const selectedSizeName = selected.selectedSize?.name?.trim().toLowerCase();
                        const slotSizeName = slot.size.name.trim().toLowerCase();
                        const slotSizePrice = slot.size.price || 0;
                        if (selectedSizeName !== slotSizeName) return Response.json({ message: `Combo "${cartProduct?.name || ""}": món "${menuItemInfo.name}" phải chọn size "${slot.size.name}"` }, { status: 400 });
                        const matchedSize = menuItemInfo.sizes?.find((s) => s.name.trim().toLowerCase() === slotSizeName && String(s.price || 0) === String(slotSizePrice));
                        if (!matchedSize) return Response.json({ message: `Combo "${cartProduct?.name || ""}": size "${slot.size.name}" không hợp lệ cho món "${menuItemInfo.name}"` }, { status: 400 });
                    }
                }
                for (let i = 0; i < comboInfo.slots.length; i++) {
                    const slot = comboInfo.slots[i];
                    const totalInSlot = selectedItems.filter((s) => s.slotIndex === i).reduce((sum, s) => sum + (s.quantity || 1), 0);
                    if (totalInSlot !== slot.quantity) {
                        const label = slot.label || slot.category?.name || `Slot ${i + 1}`;
                        return Response.json({ message: `Combo "${cartProduct?.name || ""}": "${label}" cần đúng ${slot.quantity} món (nhận được ${totalInSlot})` }, { status: 400 });
                    }
                }
                lineItems.push({ name: cartProduct.name, quantity, unitAmount: Math.round(cartProduct.price) });
                continue;
            }

            // món đơn
            const productInfo = await MenuItem.findById(cartProduct._id);
            if (!productInfo) return Response.json({ message: `Sản phẩm "${cartProduct?.name || ""}" trong giỏ hàng không tồn tại` }, { status: 400 });
            if (productInfo.status !== "on") return Response.json({ message: `Sản phẩm "${cartProduct?.name || ""}" trong giỏ hàng không còn bán` }, { status: 400 });
            let productPrice = productInfo.basePrice;
            if (cartProduct.size) {
                const size = productInfo.sizes.find((s) => s._id.toString() === cartProduct.size._id.toString());
                if (!size) return Response.json({ message: `Size của "${cartProduct?.name || ""}" không hợp lệ` }, { status: 400 });
                productPrice += size.price;
            }
            if (cartProduct.extras?.length > 0) {
                for (const cartProductExtraThing of cartProduct.extras) {
                    const extraThingInfo = productInfo.extraIngredientPrices.find((e) => e._id.toString() === cartProductExtraThing._id.toString());
                    if (!extraThingInfo) return Response.json({ message: `Extra "${cartProduct?.name || ""}" không hợp lệ` }, { status: 400 });
                    productPrice += extraThingInfo.price;
                }
            }
            const quantity = cartProduct.quantity;
            if (!Number.isInteger(quantity) || quantity < 1) return Response.json({ message: `Số lượng "${cartProduct?.name || ""}" không hợp lệ` }, { status: 400 });
            lineItems.push({ name: productInfo.name, quantity, unitAmount: Math.round(productPrice) });
        }
        const session = await getServerSession(authOptions);
        const isLoggedIn = !!session?.user?.email;
        const totalAmount = lineItems.reduce((sum, i) => sum + i.unitAmount * i.quantity, 0);

        let discountAmount = 0;
        let discountPercent = 0;
        let tierLabel = null;
        if (isLoggedIn) {
            const userInfo = await UserInfo.findOne({ email: infoProfileCheckout.email });
            const pointRewards = userInfo?.pointRewards ?? 0;
            const result = calcPointDiscount(pointRewards, totalAmount);
            discountAmount = result.discountAmount;
            discountPercent = result.discountPercent;
            tierLabel = result.tier?.label ?? null;
        }

        const finalAmount = Math.max(0, totalAmount + shipFee - discountAmount);
        // ─── Data chung để tạo Order ─────────────────────────────────────────
        const orderData = {
            ...infoProfileCheckout,
            userEmail: infoProfileCheckout.email,
            userName: infoProfileCheckout.name,
            noteDelivery,
            deliveryInfo: {
                ...deliveryInfo,
                shipFee,
                shipFeeText: deliveryInfo.mode === "pickup" ? "Miễn phí" : `${shipFee.toLocaleString("vi-VN")}đ`,
            },
            cartProducts,
            paid: false,
            paymentMethod,
            pointDiscount: { discountPercent, discountAmount, tierLabel },
        };
        // ─── COD ─────────────────────────────────────────────────────────────
        if (paymentMethod === "cod") {
            const orderDoc = await Order.create(orderData);
            await triggerOrderNotification(orderDoc);
            return Response.json({ redirectUrl: `/orders/${orderDoc._id.toString()}?clear-cart=1` });
        }

        // ─── Stripe ──────────────────────────────────────────────────────────
        if (paymentMethod === "stripe") {
            const orderDoc = await Order.create(orderData);

            // Tạo coupon nếu có discount
            let discounts = [];
            if (discountAmount > 0) {
                const coupon = await stripe.coupons.create({
                    amount_off: discountAmount,
                    currency: "vnd",
                    duration: "once",
                    name: `Giảm giá ${tierLabel || ""}`.trim(),
                });
                discounts = [{ coupon: coupon.id }];
            }

            const stripeSession = await stripe.checkout.sessions.create({
                line_items: lineItems.map((i) => ({
                    quantity: i.quantity,
                    price_data: { currency: "vnd", product_data: { name: i.name }, unit_amount: i.unitAmount },
                })),
                mode: "payment",
                customer_email: infoProfileCheckout.email,
                success_url: process.env.NEXTAUTH_URL + "orders/" + orderDoc._id.toString() + "?clear-cart=1",
                cancel_url: process.env.NEXTAUTH_URL + "cart?canceled=1",
                metadata: { orderId: orderDoc._id.toString() },
                shipping_options: [{
                    shipping_rate_data: {
                        display_name: "Delivery fee",
                        type: "fixed_amount",
                        fixed_amount: { amount: shipFee, currency: "vnd" },
                    },
                }],
                ...(discounts.length > 0 && { discounts }),
            });

            return Response.json({ redirectUrl: stripeSession.url });
        }

        // // ─── MoMo ────────────────────────────────────────────────────────────
        if (paymentMethod === "momo") {
            const orderDoc = await Order.create(orderData);
            const partnerCode = process.env.MOMO_PARTNER_CODE;
            const accessKey = process.env.MOMO_ACCESS_KEY;
            const secretKey = process.env.MOMO_SECRET_KEY;
            const orderId = orderDoc._id.toString();
            const requestId = orderId;
            const redirectUrl = `${process.env.NEXTAUTH_URL}orders/${orderId}?clear-cart=1`;
            const ipnUrl = `${process.env.NEXTAUTH_URL}api/momo/callback`;
            const requestType = "payWithMethod";
            const extraData = "";
            const rawSignature = `accessKey=${accessKey}&amount=${finalAmount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=Thanh toan don hang&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
            const signature = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");
            const momoRes = await fetch("https://test-payment.momo.vn/v2/gateway/api/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ partnerCode, accessKey, requestId, amount: finalAmount, orderId, orderInfo: "Thanh toan don hang", redirectUrl, ipnUrl, requestType, extraData, lang: "vi", signature }),
            });
            const momoData = await momoRes.json();
            if (!momoData.payUrl) return Response.json({ message: momoData.localMessage || "MoMo lỗi" }, { status: 400 });
            return Response.json({ redirectUrl: momoData.payUrl });
        }

        // ─── ZaloPay ─────────────────────────────────────────────────────────────────
        if (paymentMethod === "zalopay") {
            const orderDoc = await Order.create(orderData);
            const app_id = Number(process.env.ZALOPAY_APP_ID);
            const key1 = process.env.ZALOPAY_KEY1;
            const app_trans_id = `${moment().format("YYMMDD")}_${orderDoc._id}`;
            const app_time = Date.now();
            const embed_data = JSON.stringify({
                redirecturl: `${process.env.NEXTAUTH_URL}orders/${orderDoc._id}?clear-cart=1`,
            });
            const item = JSON.stringify([]);
            const description = `Thanh toán đơn hàng #${orderDoc._id}`;
            const callback_url = `${process.env.NEXTAUTH_URL}api/zalopay/callback`;
            await Order.findByIdAndUpdate(orderDoc._id, { app_trans_id });
            const hmac_input = `${app_id}|${app_trans_id}|${infoProfileCheckout.email}|${finalAmount}|${app_time}|${embed_data}|${item}`;
            const mac = crypto.createHmac("sha256", key1).update(hmac_input).digest("hex");

            const zaloRes = await fetch("https://sb-openapi.zalopay.vn/v2/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    app_id,
                    app_trans_id,
                    app_user: infoProfileCheckout.email,
                    app_time,
                    amount: finalAmount,
                    embed_data,
                    item,
                    description,
                    mac,
                    callback_url,
                    bank_code: "",
                }),
            });

            const zaloData = await zaloRes.json();
            if (!zaloData.order_url) return Response.json({ message: zaloData.return_message || "ZaloPay lỗi" }, { status: 400 });

            return Response.json({ redirectUrl: zaloData.order_url });
        }

        // ─── PayPal ──────────────────────────────────────────────────────────────────
        if (paymentMethod === "paypal") {
            const orderDoc = await Order.create(orderData);

            // Lấy access token
            const authRes = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Authorization: `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64")}`,
                },
                body: "grant_type=client_credentials",
            });
            const { access_token } = await authRes.json();

            // Tạo order PayPal
            const paypalRes = await fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${access_token}`,
                },
                body: JSON.stringify({
                    intent: "CAPTURE",
                    purchase_units: [{
                        amount: {
                            currency_code: "USD",
                            value: (finalAmount / EXCHANGE_RATE_VIETNAM).toFixed(2), // VNĐ → USD
                        },
                        custom_id: orderDoc._id.toString(),
                    }],
                    application_context: {
                        return_url: `${process.env.NEXTAUTH_URL}api/paypal/capture`,
                        cancel_url: `${process.env.NEXTAUTH_URL}cart?canceled=1`,
                    },
                }),
            });
            const paypalOrder = await paypalRes.json();
            const approvalUrl = paypalOrder.links?.find((l) => l.rel === "approve")?.href;
            if (!approvalUrl) return Response.json({ message: "PayPal lỗi" }, { status: 400 });

            return Response.json({ redirectUrl: approvalUrl });
        }

        return Response.json({ message: "Phương thức thanh toán không hợp lệ" }, { status: 400 });

    } catch (error) {
        console.error(error);
        return Response.json({ message: "Không thể kết nối Database" }, { status: 500 });
    }
}