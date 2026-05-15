import { model, models, Schema } from "mongoose";

const OrderSchema = new Schema({
    userEmail: String,
    userName: String,
    phone: String,
    deliveryInfo: Object,
    noteDelivery: String,
    cartProducts: Object,
    paid: { type: Boolean, default: false },
    totalOrder: Number,
}, { timestamps: true });


export const Order = models?.Order || model('Order', OrderSchema);