import { connectDB } from "@/libs/connectDB";
import { Notification } from "@/models/Notification";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session) return Response.json([], { status: 401 });

    const isAdmin = session.user?.isAdmin;
    const query = isAdmin
        ? { recipientRole: "admin" }
        : { recipientRole: "user", recipientEmail: session.user.email };

    const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(20);

    return Response.json(notifications);
}

export async function PATCH(req) {
    await connectDB();
    const { id } = await req.json();
    await Notification.findByIdAndUpdate(id, { isRead: true });
    return Response.json({ ok: true });
}