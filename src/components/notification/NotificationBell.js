"use client";
import { useNotifications } from "@/hooks/useNotifications";
import { useEffect, useRef, useState } from "react";
import Bell from "../icons/Bell";
import { timeAgo } from "@/libs/timeAgo";
import { ORDERS_ROUTE } from "@/constant/routesApp";
import { useRouter } from "next/navigation";

export function NotificationBell() {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const router = useRouter();
    const [open, setOpen] = useState(false);

    async function handleOpen() {
        setOpen(!open);
        if ("Notification" in window && Notification.permission === "default") {
            await Notification.requestPermission();
        }
    }
    const ref = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    return (
        <div className="relative hidden md:block" ref={ref}>
            <button onClick={handleOpen} className="relative p-2">
                <Bell className="hidden w-6 h-6 md:inline" />
                {unreadCount > 0 && (
                    <span className="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 rounded-full -top-0 -right-0">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 z-50 mt-2 overflow-y-auto bg-white border shadow-xl w-80 rounded-xl max-h-96">
                    <div className="flex items-center justify-between p-3 border-b">
                        <p className="text-sm font-bold">Thông báo</p>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-blue-500 hover:text-blue-700 hover:underline"
                            >
                                Đọc tất cả
                            </button>
                        )}
                    </div>

                    {notifications.length === 0 && (
                        <p className="p-4 text-sm text-center text-gray-400">Không có thông báo</p>
                    )}

                    {notifications.map(n => (
                        <div
                            key={n._id}
                            onClick={() => {
                                markAsRead(n._id); router.push(`${ORDERS_ROUTE}/${n.orderId}?from=orders`);
                                setOpen(false);
                            }}
                            className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition ${!n.isRead ? "bg-blue-50" : ""}`}
                        >
                            <p className="text-sm font-semibold">{n.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                            <p className="mt-1 text-xs text-gray-400">{timeAgo(n.createdAt)}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}