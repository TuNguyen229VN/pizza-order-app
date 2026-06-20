import crypto from "crypto";
import { markOrderPaid } from "../../webhook/route";

export const dynamic = "force-dynamic";

export async function POST(req) {
    const text = await req.text();

    let body;
    try {
        body = JSON.parse(text);
    } catch {
        return Response.json({ return_code: -1, return_message: "invalid body" });
    }

    const mac = crypto
        .createHmac("sha256", process.env.ZALOPAY_KEY2)
        .update(body.data)
        .digest("hex");

    if (mac !== body.mac) {
        return Response.json({ return_code: -1, return_message: "mac not equal" });
    }

    const data = JSON.parse(body.data);
    const orderId = data.app_trans_id.split("_").slice(1).join("_");
    // await markOrderPaid(orderId);
    await markOrderPaid(orderId, { zaloTransId: String(data.zp_trans_id) });

    return Response.json({ return_code: 1, return_message: "success" });
}