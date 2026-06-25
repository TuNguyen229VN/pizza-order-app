import { useCallback, useEffect, useState } from "react";
import { pusherClient } from "@/libs/pusherClient";
import { useSession } from "next-auth/react";
import { API_NOTIFICATION } from "@/constant/constant";

export function useNotifications() {
    const { data: session } = useSession();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        setLoading(true);
        fetch(`${API_NOTIFICATION}?page=1`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data.notifications)) {
                    setNotifications(data.notifications);
                    setHasMore(data.hasMore);
                    setUnreadCount(data.totalUnread);
                }
            })
            .finally(() => setLoading(false));
    }, []);

    // Load thêm khi scroll
    const loadMore = useCallback(async () => {
        if (!hasMore || loadingMore) return;
        setLoadingMore(true);
        const nextPage = page + 1;
        const res = await fetch(`${API_NOTIFICATION}?page=${nextPage}`);
        const data = await res.json();
        if (Array.isArray(data.notifications)) {
            setNotifications(prev => [...prev, ...data.notifications]);
            setHasMore(data.hasMore);
            setPage(nextPage);
        }
        setLoadingMore(false);
    }, [hasMore, loadingMore, page]);

    // useEffect(() => {
    //     if (!session?.user || !pusherClient) return;

    //     const isAdmin = session.user?.admin;
    //     const channelName = isAdmin
    //         ? "private-admin"
    //         : `private-user-${session.user.email.replace(/[@.]/g, "-")}`;

    //     const channel = pusherClient.subscribe(channelName);

    //     channel.bind("new-notification", ({ notification }) => {
    //         setNotifications(prev => [notification, ...prev]);
    //         setUnreadCount(prev => prev + 1);

    //         if (Notification.permission === "granted") {
    //             try {
    //                 const n = new Notification(notification.title, {
    //                     body: notification.message,
    //                     icon: "/images/thankyour.png",
    //                 });
    //             } catch (e) {
    //             }
    //         }
    //     });

    //     return () => {
    //         channel.unbind_all();
    //         pusherClient.unsubscribe(channelName);
    //     };
    // }, [session]);

    useEffect(() => {
        if (!session?.user || !pusherClient) return;

        const isAdmin = session.user?.admin;
        const userChannelName = `private-user-${session.user.email.replace(/[@.]/g, "-")}`;
        const adminChannelName = "private-admin";

        const channels = [pusherClient.subscribe(userChannelName)];
        if (isAdmin) {
            channels.push(pusherClient.subscribe(adminChannelName));
        }

        const handleNewNotification = ({ notification }) => {
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);

            if (Notification.permission === "granted") {
                try {
                    new Notification(notification.title, {
                        body: notification.message,
                        icon: "/images/thankyour.png",
                    });
                } catch (e) { }
            }
        };

        channels.forEach(channel => channel.bind("new-notification", handleNewNotification));

        return () => {
            channels.forEach(channel => {
                channel.unbind_all();
                pusherClient.unsubscribe(channel.name);
            });
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
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllAsRead = async () => {
        await fetch("/api/notifications", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ all: true }),
        });
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
    };

    return { notifications, unreadCount, markAsRead, markAllAsRead, loadMore, hasMore, loadingMore, loading };
}