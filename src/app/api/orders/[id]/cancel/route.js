import { connectDB } from "@/libs/connectDB";
import { Order } from "@/models/Order";
import { refundOrder } from "@/libs/refund";
import { CANCEL_WINDOW_MINUTES } from "@/constant/constant";
import { UserInfo } from "@/models/UserInfo";
import { sendNotification } from "@/libs/sendNotification";
import { pusherServer } from "@/libs/pusherServer";
import { renderCancelOrderEmail } from "@/mail/CancelOrderEmail";
import transporter from "@/libs/mailer";

export async function POST(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        const order = await Order.findById(id);
        if (!order) return Response.json({ message: "Đơn hàng không tồn tại" }, { status: 404 });

        if (!["pending", "confirmed"].includes(order.status)) {
            return Response.json({ message: "Đơn hàng đã được xử lý, không thể hủy" }, { status: 400 });
        }

        const minutesElapsed = (Date.now() - order.createdAt.getTime()) / 60000;
        if (minutesElapsed > CANCEL_WINDOW_MINUTES) {
            return Response.json(
                { message: `Đã quá ${CANCEL_WINDOW_MINUTES} phút, vui lòng liên hệ để được hỗ trợ` },
                { status: 400 }
            );
        }

        let refunded = false;
        if (order.refundStatus === "success") {
            return Response.json({ message: "Đơn hàng đã được refund, không thể hủy lại" }, { status: 400 });
        }

        if (order.paid) {
            // refund tiền qua cổng (nếu không phải cod)
            if (order.paymentMethod !== "cod") {
                try {
                    await refundOrder(order);
                    // refunded = true;
                    refunded = order.paymentMethod === "zalopay"
                        ? order.refundStatus === "success"
                        : true;
                } catch (err) {
                    console.error("Refund failed:", err);
                    return Response.json({ message: "Hủy đơn thất bại, vui lòng liên hệ admin" }, { status: 500 });
                }
            }

            // trừ lại điểm thưởng đã cộng lúc paid
            if (order.earnedPoints > 0) {
                await UserInfo.findOneAndUpdate(
                    { email: order.userEmail },
                    { $inc: { pointRewards: -order.earnedPoints } }
                );
            }
        }

        order.status = "cancelled";
        await order.save();

        const adminNotif = await sendNotification({
            type: "order_status",
            recipientRole: "admin",
            orderId: order._id,
            title: "Đơn hàng đã bị hủy",
            message: `Khách ${order.userName} (${order.phone}) đã hủy đơn [${order._id}]${order.paid ? " - đã refund" : ""}.`,
        });
        await pusherServer.trigger("private-admin", "new-notification", { notification: adminNotif });

        await pusherServer.trigger(`order-${order._id}`, "order-updated", {
            status: "cancelled",
            paid: order.paid,
        });

        // send mail
        if (order.userEmail) {
            transporter.sendMail({
                from: `"Pizza Teo" <${process.env.GMAIL_USER}>`,
                to: order.userEmail,
                replyTo: process.env.GMAIL_USER,
                subject: `Đơn hàng #${order._id} đã bị hủy`,
                html: renderCancelOrderEmail({
                    orderId: order._id,
                    userName: order.userName,
                    total: order.totalOrder,
                    refunded,
                    paymentMethod: order.paymentMethod,
                }),
            }).catch((err) => console.error("Send cancel email failed:", err));
        }

        return Response.json({ message: "Đã hủy đơn hàng" });
    } catch (error) {
        console.error(error);
        return Response.json({ message: "Lỗi server" }, { status: 500 });
    }
}