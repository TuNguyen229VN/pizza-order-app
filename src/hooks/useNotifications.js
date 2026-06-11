import { useEffect, useState } from "react";
import { pusherClient } from "@/libs/pusherClient";
import { useSession } from "next-auth/react";

export function useNotifications() {
    const { data: session } = useSession();
    const [notifications, setNotifications] = useState([]);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    useEffect(() => {
        fetch("/api/notifications")
            .then(res => res.json())
            .then(data => Array.isArray(data) && setNotifications(data));
    }, []);

    useEffect(() => {
        if (!session?.user || !pusherClient) return;

        // pusherClient.config.authEndpoint = "/api/pusher/auth";

        const isAdmin = session.user?.admin;
        const channelName = isAdmin
            ? "private-admin"
            : `private-user-${session.user.email.replace(/[@.]/g, "-")}`;

        const channel = pusherClient.subscribe(channelName);
        channel.bind("new-notification", ({ notification }) => {
            setNotifications(prev => [notification, ...prev]);
        });

        return () => {
            channel.unbind_all();
            pusherClient.unsubscribe(channelName);
        };
    }, [session]);

    const markAsRead = async (id) => {
        await fetch("/api/notifications", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        setNotifications(prev =>
            prev.map(n => n._id === id ? { ...n, isRead: true } : n)
        );
    };

    return { notifications, unreadCount, markAsRead };
}