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
    earnedPoints: { type: Number, default: 0 }, 
    paymentMethod: String,
    app_trans_id: { type: String },
    status: {
        type: String,
        enum: ["pending", "confirmed", "preparing", "delivering", "completed", "cancelled"],
        default: "pending",
    },
    paymentRef: {
        stripePaymentIntentId: { type: String, default: null },
        momoTransId: { type: String, default: null },
        zaloTransId: { type: String, default: null },
        paypalCaptureId: { type: String, default: null },
    },
    pointDiscount: {
        discountPercent: { type: Number, default: 0 },
        discountAmount: { type: Number, default: 0 },
        tierLabel: { type: String, default: null },
    },
}, { timestamps: true });

// Tự xóa sau 24h nếu chưa paid
OrderSchema.index(
    { createdAt: 1 },
    { expireAfterSeconds: 86400, partialFilterExpression: { paid: false } }
);

export const Order = models?.Order || model('Order', OrderSchema);