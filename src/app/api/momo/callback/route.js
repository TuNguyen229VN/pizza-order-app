import { markOrderPaid } from "@/libs/markOrder";
import crypto from "crypto";

export async function POST(req) {
    const body = await req.json();
    const secretKey = process.env.MOMO_SECRET_KEY;
    const rawSignature = `accessKey=${process.env.MOMO_ACCESS_KEY}&amount=${body.amount}&extraData=${body.extraData}&message=${body.message}&orderId=${body.orderId}&orderInfo=${body.orderInfo}&orderType=${body.orderType}&partnerCode=${body.partnerCode}&payType=${body.payType}&requestId=${body.requestId}&responseTime=${body.responseTime}&resultCode=${body.resultCode}&transId=${body.transId}`;
    const signature = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");
    console.log("rawSignature:", rawSignature);
    console.log("computed:", signature);
    console.log("momo sent:", body.signature);
    console.log("secretKey length:", secretKey?.length, JSON.stringify(secretKey));
    if (signature !== body.signature) return Response.json({ message: "invalid signature" }, { status: 400 });
    // if (body.resultCode === 0) await markOrderPaid(body.orderId);
    if (Number(body.resultCode) === 0) {
        await markOrderPaid(body.orderId, { momoTransId: String(body.transId) });
    }
    return Response.json({ message: "ok" });
}

export async function GET() {
    return Response.json({ ok: true });
}