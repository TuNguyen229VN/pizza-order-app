import { connectDB } from "@/libs/connectDB";
import { Order } from '@/models/Order';
import { pusherServer } from "@/libs/pusherServer";
import { sendNotification } from "@/libs/sendNotification";
import { UserInfo } from "@/models/UserInfo";
import { totalCartPrice } from "@/libs/priceUtils";
import { DIVISION_POINT } from "@/constant/constant";
import transporter from "@/libs/mailer";
import { renderOrderInvoiceEmail } from "@/mail/RenderOrderEmail";
import { MenuItem } from "@/models/MenuItem";
import { ComboDetail } from "@/models/ComboDetail";

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function checkItemsAvailability(cartProducts) {
    const issues = [];
    for (const cp of cartProducts ?? []) {
        if (cp.type === "combo") {
            const combo = await ComboDetail.findById(cp._id);
            if (!combo) issues.push(`Combo "${cp.name}" đã bị xóa`);
            else if (combo.status !== "on") issues.push(`Combo "${cp.name}" đã bị tắt bán`);
        } else {
            const item = await MenuItem.findById(cp._id);
            if (!item) issues.push(`Món "${cp.name}" đã bị xóa`);
            else if (item.status !== "on") issues.push(`Món "${cp.name}" đã bị tắt bán`);
        }
    }
    return issues;
}

// Dùng chung cho stripe + momo + zalopay callback
export async function markOrderPaid(orderId, paymentRef = null) {
    await connectDB();

    const existingOrder = await Order.findById(orderId);
    if (!existingOrder) return null;

    const updateData = { paid: true };
    if (paymentRef) {
        for (const [key, value] of Object.entries(paymentRef)) {
            updateData[`paymentRef.${key}`] = value;
        }
    }

    if (existingOrder.status === "pending") {
        updateData.status = "confirmed";
    }
    const order = await Order.findByIdAndUpdate(orderId, updateData, { new: true });
    if (!order) return null;

    // re-check item còn bán không, KHÔNG block payment, chỉ cảnh báo admin
    const issues = await checkItemsAvailability(order.cartProducts);
    if (issues.length > 0) {
        const adminWarnNotif = await sendNotification({
            type: "order_status",
            recipientRole: "admin",
            orderId: order._id,
            title: "Đơn đã thanh toán có món không còn bán",
            message: `Đơn [${order._id}]: ${issues.join("; ")}`,
        });
        await pusherServer.trigger("private-admin", "new-notification", { notification: adminWarnNotif });
    }

    const subtotal = totalCartPrice(order.cartProducts ?? []);
    const deliveryFee = order.deliveryInfo?.shipFee ?? 0;
    const earnedPoints = Math.floor((subtotal + deliveryFee) / DIVISION_POINT);

    if (order.isLoggedIn && earnedPoints > 0) {
        const updatedUser = await UserInfo.findOneAndUpdate(
            { email: order.userEmail },
            { $inc: { pointRewards: earnedPoints } },
            { new: true }
        );
        if (updatedUser) {
            order.earnedPoints = earnedPoints;
            await order.save();
        }
    }

    const [userNotif, adminNotif] = await Promise.all([
        sendNotification({
            type: "order_placed",
            recipientRole: "user",
            recipientEmail: order.userEmail,
            orderId: order._id,
            title: "Đặt hàng thành công",
            message: `Đơn hàng [${order._id}] của bạn đã được thanh toán!`,
        }),
        sendNotification({
            type: "order_placed",
            recipientRole: "admin",
            orderId: order._id,
            title: "Đơn hàng mới",
            message: `Khách ${order.userName} (${order.phone}) vừa thanh toán đơn [${order._id}] - ${order.paymentMethod?.toUpperCase()}.`,
        }),
    ]);

    await Promise.all([
        pusherServer.trigger(
            `private-user-${order.userEmail.replace(/[@.]/g, "-")}`,
            "new-notification",
            { notification: userNotif }
        ),
        pusherServer.trigger("private-admin", "new-notification", { notification: adminNotif }),
        // mail
        transporter.sendMail({
            from: `"Pizza Teo" <${process.env.GMAIL_USER}>`,
            to: order.userEmail,
            replyTo: process.env.GMAIL_USER,
            subject: `Hóa đơn thanh toán #${order._id}`,
            html: renderOrderInvoiceEmail({ order, subtotal, deliveryFee, earnedPoints }),
        }).catch(err => console.error("Invoice email failed:", err)),
    ]);

    await pusherServer.trigger(`order-${order._id}`, "order-updated", {
        status: order.status,
        paid: order.paid,
    });


    return order;
}

export async function POST(req) {
    const sig = req.headers.get('stripe-signature');
    let event;

    try {
        const reqBuffer = await req.text();
        event = stripe.webhooks.constructEvent(reqBuffer, sig, process.env.STRIPE_SIGN_SECRET);
    } catch (e) {
        return Response.json(e, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const orderId = event?.data?.object?.metadata?.orderId;
        const isPaid = event?.data?.object?.payment_status === 'paid';
        if (isPaid) await markOrderPaid(orderId, { stripePaymentIntentId: session.payment_intent });
    }

    return Response.json('ok', { status: 200 });
}