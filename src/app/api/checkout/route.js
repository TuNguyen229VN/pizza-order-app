import { connectDB } from "@/libs/connectDB";
import { authOptions } from "../auth/[...nextauth]/route";
import { Order } from "@/models/Order";
import { MenuItem } from "@/models/MenuItem";
import { getServerSession } from "next-auth";
import { validateForm, validators } from "@/libs/validators";
import { calcDeliveryInfo } from "@/utils/utils";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

export async function POST(req) {
    try {
        await connectDB();
        const { cartProducts, infoProfileCheckout, deliveryInfo, noteDelivery } = await req.json();

        // const session = await getServerSession(authOptions);
        // const userEmail = session?.user?.email;
        if (!deliveryInfo) {
            return Response.json({ message: "Vui lòng nhập địa chỉ để giao hàng hoặc mua mang về" }, { status: 400 });
        }
        const { isValid, errors } = validateForm({
            name: {
                value: infoProfileCheckout.name,
                rules: [validators.required("họ và tên"), validators.minLength(2), validators.maxLength(200)],
            },
            email: {
                value: infoProfileCheckout.email,
                rules: [validators.required("email"), validators.email],
            },
            phone: {
                value: infoProfileCheckout.phone,
                rules: [validators.required("số điện thoại"), validators.phone],
            },
            noteDelivery: {
                value: noteDelivery,
                rules: [validators.maxLength(200)]
            }
        })

        if (!isValid) {
            return Response.json({ message: "Dữ liệu không hợp lệ", errors }, { status: 400 });
        }

        let shipFee = 0;
        if (deliveryInfo.mode === "delivery") {
            if (!deliveryInfo.lat || !deliveryInfo.lng) {
                return Response.json({ message: "Thiếu tọa độ giao hàng" }, { status: 400 });
            }
            const serverDeliveryInfo = calcDeliveryInfo(deliveryInfo.lat, deliveryInfo.lng);
            if (!serverDeliveryInfo?.canDeliver) {
                return Response.json({ message: "Địa chỉ ngoài vùng giao hàng" }, { status: 400 });
            }
            shipFee = serverDeliveryInfo.fee;
        }

        const stripeLineItems = [];
        for (const cartProduct of cartProducts) {

            const productInfo = await MenuItem.findById(cartProduct._id);
            if (!productInfo) {
                return Response.json({ message: 'Sản phẩm trong giỏ hàng không tồn tại' }, { status: 400 });
            }

            if (productInfo.status !== "on") {
                return Response.json({ message: 'Sản phẩm trong giỏ hàng không còn bán' }, { status: 400 });
            }

            let productPrice = productInfo.basePrice;
            if (cartProduct.size) {
                const size = productInfo.sizes
                    .find(size => size._id.toString() === cartProduct.size._id.toString());
                if (!size) return Response.json({ message: 'Size không hợp lệ' }, { status: 400 });
                productPrice += size.price;
            }
            if (cartProduct.extras?.length > 0) {
                for (const cartProductExtraThing of cartProduct.extras) {
                    const productExtras = productInfo.extraIngredientPrices;
                    const extraThingInfo = productExtras
                        .find(extra => extra._id.toString() === cartProductExtraThing._id.toString());
                    if (!extraThingInfo) return Response.json({ message: 'Extra không hợp lệ' }, { status: 400 });
                    productPrice += extraThingInfo.price;
                }
            }

            const quantity = cartProduct.quantity;
            if (!Number.isInteger(quantity) || quantity < 1) {
                return Response.json({ message: 'Số lượng không hợp lệ' }, { status: 400 });
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

        const orderDoc = await Order.create({
            ...infoProfileCheckout,
            userEmail: infoProfileCheckout.email,
            userName: infoProfileCheckout.name,
            noteDelivery,
            deliveryInfo: {
                ...deliveryInfo,
                shipFee,
                shipFeeText: deliveryInfo.mode === "pickup" ? "Miễn phí" : `${shipFee.toLocaleString('vi-VN')}đ`,
            },
            cartProducts,
            paid: false,
        });

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
                        fixed_amount: { amount: shipFee, currency: "vnd" }
                    }
                }
            ]
        })

        return Response.json(stripeSession.url);
    } catch (error) {
        return Response.json({ message: "Không thể kết nối Database" }, { status: 500 });
    }
}