import { pusherServer } from "@/libs/pusherServer";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.text();
    const params = new URLSearchParams(data);
    const socketId = params.get("socket_id");
    const channelName = params.get("channel_name");
    const isAdmin = session.user?.admin;
    const userChannel = `private-user-${session.user.email.replace(/[@.]/g, "-")}`;

    const allowed =
        (channelName === "private-admin" && isAdmin) ||
        (channelName === userChannel);

    if (!allowed) return Response.json({ error: "Forbidden" }, { status: 403 });

    const authResponse = pusherServer.authorizeChannel(socketId, channelName);
    return Response.json(authResponse);
}