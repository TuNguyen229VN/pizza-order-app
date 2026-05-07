import { connectDB } from "@/libs/connectDB";
import { authOptions } from "../auth/[...nextauth]/route";
import { Order } from "@/models/Order";
import { MenuItem } from "@/models/MenuItem";
import { getServerSession } from "next-auth";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

export async function POST(req) {
    await connectDB();
    const { cartProducts, infoProfileCheckout } = await req.json();
    console.log(infoProfileCheckout)
    // const session = await getServerSession(authOptions);
    // const userEmail = session?.user?.email;

    const orderDoc = await Order.create({
        ...infoProfileCheckout,
        userEmail: infoProfileCheckout.email,
        userName: infoProfileCheckout.name,
        cartProducts,
        paid: false,
    });

    const stripeLineItems = [];
    for (const cartProduct of cartProducts) {

        const productInfo = await MenuItem.findById(cartProduct._id);
        if (!productInfo) {
            return Response.json({ error: 'Sản phẩm không tồn tại' }, { status: 400 });
        }

        let productPrice = productInfo.basePrice;
        if (cartProduct.size) {
            const size = productInfo.sizes
                .find(size => size._id.toString() === cartProduct.size._id.toString());
            if (!size) return Response.json({ error: 'Size không hợp lệ' }, { status: 400 });
            productPrice += size.price;
        }
        if (cartProduct.extras?.length > 0) {
            for (const cartProductExtraThing of cartProduct.extras) {
                const productExtras = productInfo.extraIngredientPrices;
                const extraThingInfo = productExtras
                    .find(extra => extra._id.toString() === cartProductExtraThing._id.toString());
                if (!extraThingInfo) return Response.json({ error: 'Extra không hợp lệ' }, { status: 400 });
                productPrice += extraThingInfo.price;
            }
        }

        const quantity = cartProduct.quantity;
        if (!Number.isInteger(quantity) || quantity < 1) {
            return Response.json({ error: 'Số lượng không hợp lệ' }, { status: 400 });
        }

        stripeLineItems.push({
            quantity,
            price_data: {
                currency: 'vnd',
                product_data: {
                    name: productInfo.name,
                },
                unit_amount: Math.round(productPrice),
            },
        });
    }

    const stripeSession = await stripe.checkout.sessions.create({
        line_items: stripeLineItems,
        mode: "payment",
        customer_email: infoProfileCheckout.email,
        success_url: process.env.NEXTAUTH_URL + 'orders/' + orderDoc._id.toString() + '?clear-cart=1',
        cancel_url: process.env.NEXTAUTH_URL + 'cart?canceled=1',
        metadata: { orderId: orderDoc._id.toString() },
        shipping_options: [
            {
                shipping_rate_data: {
                    display_name: "Delivery fee",
                    type: "fixed_amount",
                    fixed_amount: { amount: 5000, currency: "vnd" }
                }
            }
        ]
    })

    return Response.json(stripeSession.url);
}