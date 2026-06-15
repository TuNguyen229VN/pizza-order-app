import { markOrderPaid } from "../../webhook/route";


export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    const basicAuth = Buffer.from(
        `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString("base64");

    // Capture thẳng bằng Basic Auth, không cần lấy access_token mới
    const captureRes = await fetch(
        `https://api-m.sandbox.paypal.com/v2/checkout/orders/${token}/capture`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${basicAuth}`,
            },
        }
    );

    const capture = await captureRes.json();

    if (capture.status !== "COMPLETED") {
        return Response.redirect(`${process.env.NEXTAUTH_URL}cart?canceled=1`);
    }

    const orderId = capture.purchase_units?.[0]?.payments?.captures?.[0]?.custom_id;
    await markOrderPaid(orderId);

    return Response.redirect(`${process.env.NEXTAUTH_URL}orders/${orderId}?clear-cart=1`);
}