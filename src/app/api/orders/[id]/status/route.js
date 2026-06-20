import { connectDB } from "@/libs/connectDB";
import { Order } from "@/models/Order";
import { isAdmin } from "../../../auth/[...nextauth]/route";
import { pusherServer } from "@/libs/pusherServer";
import { sendNotification } from "@/libs/sendNotification";
import { ORDER_STATUS_FLOW } from "@/constant/constant";

const STATUS_LABELS = {
    confirmed: "Đã xác nhận",
    preparing: "Đang chuẩn bị",
    delivering: "Đang giao hàng",
    completed: "Hoàn thành",
};

export async function PATCH(req, { params }) {
    try {
        await connectDB();

        const admin = await isAdmin();
        if (!admin) {
            return Response.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const { status: nextStatus } = await req.json();

        const order = await Order.findById(id);
        if (!order) {
            return Response.json({ message: "Không tìm thấy đơn hàng" }, { status: 404 });
        }

        if (order.status === "cancelled" || order.status === "completed") {
            return Response.json(
                { message: `Đơn hàng đã ở trạng thái "${order.status}", không thể đổi tiếp` },
                { status: 400 }
            );
        }

        const mode = order.deliveryInfo?.mode === "delivery" ? "delivery" : "pickup";
        const flow = ORDER_STATUS_FLOW[mode];

        // delivering chỉ áp dụng cho đơn delivery — đơn pickup không có trong flow nên tự bị chặn ở đây
        if (!flow.includes(nextStatus)) {
            return Response.json(
                { message: `Trạng thái "${nextStatus}" không hợp lệ cho đơn ${mode === "delivery" ? "giao hàng" : "mua mang về"}` },
                { status: 400 }
            );
        }

        const currentIdx = flow.indexOf(order.status);
        const nextIdx = flow.indexOf(nextStatus);

        // chỉ cho phép tiến lên đúng 1 bước kế tiếp trong flow, không nhảy cóc, không lùi
        if (nextIdx !== currentIdx + 1) {
            return Response.json(
                { message: `Không thể chuyển từ "${order.status}" sang "${nextStatus}"` },
                { status: 400 }
            );
        }

        order.status = nextStatus;
        await order.save();
        await pusherServer.trigger(`order-${order._id}`, "order-updated", {
            status: order.status,
            paid: order.paid,
        });

        const userNotif = await sendNotification({
            type: "order_status",
            recipientRole: "user",
            recipientEmail: order.userEmail,
            orderId: order._id,
            title: "Cập nhật đơn hàng",
            message: `Đơn hàng [${order._id}] của bạn: ${STATUS_LABELS[nextStatus] || nextStatus}`,
        });
        await pusherServer.trigger(
            `private-user-${order.userEmail.replace(/[@.]/g, "-")}`,
            "new-notification",
            { notification: userNotif }
        );

        return Response.json(order);
    } catch (error) {
        console.error(error);
        return Response.json({ message: "Lỗi server" }, { status: 500 });
    }
}