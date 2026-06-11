"use client";
import { useNotifications } from "@/hooks/useNotifications";
import { useState } from "react";
import Bell from "../icons/Bell";


export function NotificationBell() {
    const { notifications, unreadCount, markAsRead } = useNotifications();
    const [open, setOpen] = useState(false);

    return (
        <div className="relative">
            <button onClick={() => setOpen(!open)} className="relative p-2">
                <Bell className="hidden w-6 h-6 md:inline" />
                {unreadCount > 0 && (
                    <span className="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 rounded-full -top-0 -right-0">
                        {unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 z-50 mt-2 overflow-y-auto bg-white border shadow-xl w-80 rounded-xl max-h-96">
                    <p className="p-3 text-sm font-bold border-b">Thông báo</p>
                    {notifications.length === 0 && (
                        <p className="p-4 text-sm text-center text-gray-400">Không có thông báo</p>
                    )}
                    {notifications.map(n => (
                        <div
                            key={n._id}
                            onClick={() => markAsRead(n._id)}
                            className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition ${!n.isRead ? "bg-blue-50" : ""}`}
                        >
                            <p className="text-sm font-semibold">{n.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}