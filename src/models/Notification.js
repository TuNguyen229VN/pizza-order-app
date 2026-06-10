import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
    type: { type: String, enum: ["order_placed", "order_status"], required: true },
    recipientRole: { type: String, enum: ["user", "admin"], required: true },
    recipientEmail: { type: String },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

export const Notification = mongoose.models.Notification
    || mongoose.model("Notification", NotificationSchema);