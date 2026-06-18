"use client";
import { useEffect, useRef, useState } from "react";
import Bell from "../icons/Bell";
import { timeAgo } from "@/libs/timeAgo";
import { NOTIFICATION_ROUTE, ORDERS_ROUTE } from "@/constant/routesApp";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SkeletonLoadingNotification from "../skeleton/SkeletonLoadingNotification";
import { useNotificationContext } from "@/context/NotificationContext";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

export function NotificationBell() {
    const { notifications, unreadCount, markAsRead, loadMore, hasMore, loadingMore, loading } = useNotificationContext();
    const router = useRouter();
    const sTrans = useTranslations("System");
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const listRef = useRef(null);
    const session = useSession();
    const { status } = session;
    async function handleOpen() {
        setOpen(!open);
        if ("Notification" in window && Notification.permission === "default") {
            await Notification.requestPermission();
        }
    }

    function handleScroll() {
        const el = listRef.current;
        if (!el) return;
        // Khi scroll gần tới cuối
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
            loadMore();
        }
    }

    useEffect(() => {
        function handleClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    if (status === "unauthenticated") return (
        <div className="relative hidden md:block" ref={ref}>
            <button onClick={handleOpen} className="relative">
                <Bell className="hidden w-6 h-6 md:inline" />
                {unreadCount > 0 && (
                    <span className="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 rounded-full -top-0 -right-0">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div
                    className="absolute right-0 z-50 mt-2 overflow-y-auto bg-white border shadow-xl w-80 rounded-xl max-h-96">
                    <div className="flex items-center justify-between p-3 border-b">
                        <p className="text-sm font-bold">{sTrans("Thông báo")}</p>
                    </div>
                    <p className="p-4 text-sm text-center text-gray-400">{sTrans("Không có thông báo")}</p>
                </div>
            )}
        </div>
    );
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
                <div ref={listRef}
                    onScroll={handleScroll}
                    className="absolute right-0 z-50 mt-2 overflow-y-auto bg-white border shadow-xl w-80 rounded-xl max-h-96">
                    <div className="flex items-center justify-between p-3 border-b">
                        <p className="text-sm font-bold">{sTrans("Thông báo")}</p>
                        {!loading && notifications.length > 0 && (
                            <Link
                                href={NOTIFICATION_ROUTE}
                                className="text-xs text-blue-500 hover:text-blue-700 hover:underline"
                            >
                                {sTrans("Xem tất cả")}
                            </Link>
                        )}
                    </div>
                    {loading && (
                        Array.from({ length: 4 }).map((_, i) => (
                            <SkeletonLoadingNotification key={i} />
                        ))
                    )}

                    {!loading && notifications.length === 0 && (
                        <p className="p-4 text-sm text-center text-gray-400">{sTrans("Không có thông báo")}</p>
                    )}

                    {!loading && notifications.map(n => (
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
                            <p className="mt-1 text-xs text-gray-400">{timeAgo(n.createdAt,sTrans)}</p>
                        </div>
                    ))}
                    {loadingMore && <p className="p-3 text-xs text-center text-gray-400">{sTrans("Đang tải")}...</p>}
                    {!hasMore && notifications.length > 0 && (
                        <p className="p-3 text-xs text-center text-gray-400">{sTrans("Đã tải hết")}</p>
                    )}
                </div>
            )}
        </div>
    );
}