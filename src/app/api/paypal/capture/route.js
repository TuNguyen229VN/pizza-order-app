import { markOrderPaid } from "../../webhook/route";


export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token"); // PayPal order ID

    // Lấy access token
    const authRes = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64")}`,
        },
        body: "grant_type=client_credentials",
    });
    const { access_token } = await authRes.json();

    // Capture payment
    const captureRes = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${token}/capture`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
        },
    });
    const capture = await captureRes.json();

    if (capture.status !== "COMPLETED") {
        return Response.redirect(`${process.env.NEXTAUTH_URL}cart?canceled=1`);
    }

    const orderId = capture.purchase_units?.[0]?.payments?.captures?.[0]?.custom_id;
    await markOrderPaid(orderId);

    return Response.redirect(`${process.env.NEXTAUTH_URL}orders/${orderId}?clear-cart=1`);
}