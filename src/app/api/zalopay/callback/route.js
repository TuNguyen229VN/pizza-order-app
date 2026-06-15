import crypto from "crypto";
import { markOrderPaid } from "../../webhook/route";

export const dynamic = "force-dynamic";

export async function POST(req) {
    const text = await req.text();
    console.log("ZaloPay raw body:", text);

    // Extract raw data string trước khi JSON parse làm thay đổi nó
    const dataMatch = text.match(/"data":"((?:[^"\\]|\\.)*)"/);
    if (!dataMatch) {
        return Response.json({ return_code: -1, return_message: "missing data" });
    }

    // Unescape manually để lấy đúng string ZaloPay dùng tính MAC
    const rawDataString = dataMatch[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\');

    const body = JSON.parse(text);
    console.log("body.data:", body.data);
    const mac = crypto
        .createHmac("sha256", "kLtgPl8HHhfvMuDHPwKfgfsZ4Gu8VMBe") // hardcode thẳng
        .update(body.data)
        .digest("hex");

    console.log("Expected mac:", mac);
    console.log("Received mac:", body.mac);

    if (mac !== body.mac) {
        console.log("MAC mismatch — rejected");
        return Response.json({ return_code: -1, return_message: "mac not equal" });
    }

    const data = JSON.parse(rawDataString);
    const orderId = data.app_trans_id.split("_").slice(1).join("_");
    await markOrderPaid(orderId);

    return Response.json({ return_code: 1, return_message: "success" });
}