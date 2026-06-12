"use client"
import NotFindLayout from '@/components/layout/NotFindLayout';
import UserTabs from '@/components/layout/UserTabs';
import UseProfile from '@/components/UseProfile';
import { ORDERS_ROUTE } from '@/constant/routesApp';
import ContainerProfileLeft from '@/container/ContainerProfileLeft';
import { useNotifications } from '@/hooks/useNotifications';
import { timeAgo } from '@/libs/timeAgo';
import HeaderCart from '@/modules/cart/HeaderCart';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React from 'react'

export default function NotificationPage() {
  const session = useSession();
  const router = useRouter();
  const { status, data } = session;
  const { loading, data: profile } = UseProfile();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  if (status === "unauthenticated") {
    router.push(LOGIN_ROUTE);
    return null;
  }
  if (status === "authenticated" && data?.user?.status === "on") {
    router.push(LOGIN_ROUTE);
    return null;
  }
  if (status === "loading") {
    return "Loading...";
  }
  return (
    <section>
      <HeaderCart text="Tài khoản" />
      <div className="grid gap-6 md:grid-cols-3">
        <UserTabs isAdmin={profile.admin}></UserTabs>

        <div className="col-span-2">
          <ContainerProfileLeft  title={`Thông báo${unreadCount > 0 ? ` (${unreadCount})` : ""}`}>
            <div className="flex items-center justify-end p-3 border-b">
              {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-500 hover:text-blue-700 hover:underline"
              >
                Đọc tất cả
              </button>
              )}
            </div>
            {notifications.length === 0 && <NotFindLayout title='Chúng tôi không có thông báo nào cho bạn vào lúc này.' content='Vui lòng kiểm tra lại sau' className={"mt-4 md:mt-10"} />}
            {notifications.map(n => (
              <div
                key={n._id}
                onClick={() => {
                  markAsRead(n._id); router.push(`${ORDERS_ROUTE}/${n.orderId}?from=orders`);
                }}
                className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition ${!n.isRead ? "bg-blue-50" : ""}`}
              >
                <p className="font-medium ">{n.title}</p>
                <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                <p className="mt-1 text-xs text-gray-400 text-end">{timeAgo(n.createdAt)}</p>
              </div>
            ))}
          </ContainerProfileLeft>
        </div>
      </div>
    </section>
  )
}
