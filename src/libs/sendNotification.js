import { Notification } from "@/models/Notification";

export async function sendNotification({ type, recipientRole, recipientEmail, orderId, title, message }) {
    return Notification.create({ type, recipientRole, recipientEmail, orderId, title, message });
}