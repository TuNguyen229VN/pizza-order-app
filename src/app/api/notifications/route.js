import { connectDB } from "@/libs/connectDB";
import { Notification } from "@/models/Notification";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session) return Response.json([], { status: 401 });

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = 15;
    const skip = (page - 1) * limit;
    const isAdmin = session.user?.admin;
    const query = isAdmin
        ? {
            $or: [
                { recipientRole: "admin" },
                { recipientRole: "user", recipientEmail: session.user.email },
            ]
        }
        : { recipientRole: "user", recipientEmail: session.user.email };
    const [notifications, total, totalUnread] = await Promise.all([
        Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Notification.countDocuments(query),
        Notification.countDocuments({ ...query, isRead: false }),
    ]);

    return Response.json({ notifications, hasMore: skip + notifications.length < total, totalUnread });
}

export async function PATCH(req) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id, all } = await req.json();

    // Mark all
    if (all) {
        const isAdmin = session.user?.admin;
        const query = isAdmin
            ? {
                $or: [
                    { recipientRole: "admin" },
                    { recipientRole: "user", recipientEmail: session.user.email },
                ]
            }
            : { recipientRole: "user", recipientEmail: session.user.email, isRead: false };

        await Notification.updateMany(query, { isRead: true });
        return Response.json({ ok: true });
    }

    // Mark one
    await Notification.findByIdAndUpdate(id, { isRead: true });
    return Response.json({ ok: true });
}