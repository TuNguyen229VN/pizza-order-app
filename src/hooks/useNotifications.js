import { useEffect, useState } from "react";
import { pusherClient } from "@/libs/pusherClient";
import { useSession } from "next-auth/react";
import { API_NOTIFICATION } from "@/constant/constant";

export function useNotifications() {
    const { data: session } = useSession();
    const [notifications, setNotifications] = useState([]);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    useEffect(() => {
        fetch(API_NOTIFICATION)
            .then(res => res.json())
            .then(data => Array.isArray(data) && setNotifications(data));
    }, []);

    useEffect(() => {
        if (!session?.user || !pusherClient) return;

        const isAdmin = session.user?.admin;
        const channelName = isAdmin
            ? "private-admin"
            : `private-user-${session.user.email.replace(/[@.]/g, "-")}`;

        const channel = pusherClient.subscribe(channelName);

        channel.bind("new-notification", ({ notification }) => {
            setNotifications(prev => [notification, ...prev]);

            if (Notification.permission === "granted") {
                try {
                    const n = new Notification(notification.title, {
                        body: notification.message,
                        icon: "/images/thankyour.png",
                    });
                } catch (e) {
                }
            }
        });

        return () => {
            channel.unbind_all();
            pusherClient.unsubscribe(channelName);
        };
    }, [session]);

    const markAsRead = async (id) => {
        await fetch(API_NOTIFICATION, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        setNotifications(prev =>
            prev.map(n => n._id === id ? { ...n, isRead: true } : n)
        );
    };

    async function markAllAsRead() {
        const unread = notifications.filter(n => !n.isRead);
        await Promise.all(unread.map(n =>
            fetch(API_NOTIFICATION, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: n._id }),
            })
        ));
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }

    return { notifications, unreadCount, markAsRead,markAllAsRead };
}