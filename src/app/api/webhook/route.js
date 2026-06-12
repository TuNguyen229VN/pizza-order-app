import { connectDB } from "@/libs/connectDB";
import { Order } from '@/models/Order';
import { pusherServer } from "@/libs/pusherServer";
import { sendNotification } from "@/libs/sendNotification";

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
    const sig = req.headers.get('stripe-signature');
    let event;

    try {
        const reqBuffer = await req.text();
        const signSecret = process.env.STRIPE_SIGN_SECRET;
        event = stripe.webhooks.constructEvent(reqBuffer, sig, signSecret);
    } catch (e) {
        return Response.json(e, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
        const orderId = event?.data?.object?.metadata?.orderId;
        const isPaid = event?.data?.object?.payment_status === 'paid';

        if (isPaid) {
            await connectDB();
            const order = await Order.findByIdAndUpdate(
                orderId,
                { paid: true },
                { new: true }
            );

            if (order) {
                const [userNotif, adminNotif] = await Promise.all([
                    sendNotification({
                        type: "order_placed",
                        recipientRole: "user",
                        recipientEmail: order.userEmail,
                        orderId: order._id,
                        title: "Đặt hàng thành công 🎉",
                        message: `Đơn hàng [${order._id}] của bạn đã được thanh toán!`,
                    }),
                    sendNotification({
                        type: "order_placed",
                        recipientRole: "admin",
                        orderId: order._id,
                        title: "Đơn hàng mới!",
                        message: `Khách ${order.userName} (${order.phone}) vừa thanh toán đơn [${order._id}].`,
                    }),
                ]);

                await Promise.all([
                    pusherServer.trigger(
                        `private-user-${order.userEmail.replace(/[@.]/g, "-")}`,
                        "new-notification",
                        { notification: userNotif }
                    ),
                    pusherServer.trigger(
                        "private-admin",
                        "new-notification",
                        { notification: adminNotif }
                    ),
                ]);
            }
        }
    }

    return Response.json('ok', { status: 200 });
}