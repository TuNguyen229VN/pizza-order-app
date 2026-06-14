import crypto from "crypto";
import { markOrderPaid } from "../../webhook/route";


export async function POST(req) {
    const body = await req.json();
    const mac = crypto.createHmac("sha256", process.env.ZALOPAY_KEY2).update(body.data).digest("hex");

    if (mac !== body.mac) return Response.json({ return_code: -1, return_message: "mac not equal" });

    const data = JSON.parse(body.data);
    // app_trans_id format: "YYMMDD_orderId"
    const orderId = data.app_trans_id.split("_").slice(1).join("_");
    await markOrderPaid(orderId);

    return Response.json({ return_code: 1, return_message: "success" });
}