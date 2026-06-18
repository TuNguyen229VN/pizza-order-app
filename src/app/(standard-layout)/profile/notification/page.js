"use client"
import NotFindLayout from '@/components/layout/NotFindLayout';
import UserTabs from '@/components/layout/UserTabs';
import LoadingCat from '@/components/loading/LoadingCat';
import SkeletonLoadingNotification from '@/components/skeleton/SkeletonLoadingNotification';
import UseProfile from '@/components/UseProfile';
import { ORDERS_ROUTE } from '@/constant/routesApp';
import ContainerProfileLeft from '@/container/ContainerProfileLeft';
import { useNotificationContext } from '@/context/NotificationContext';
import { timeAgo } from '@/libs/timeAgo';
import HeaderCart from '@/modules/cart/HeaderCart';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React, { useRef } from 'react'

export default function NotificationPage() {
  const session = useSession();
  const router = useRouter();
   const sTrans = useTranslations("System");
  const { status, data } = session;
  const { data: profile } = UseProfile();
  const listRef = useRef(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead, loadMore, hasMore, loadingMore, loading } = useNotificationContext();
  if (status === "unauthenticated") {
    router.push(LOGIN_ROUTE);
    return null;
  }
  if (status === "authenticated" && data?.user?.status === "on") {
    router.push(LOGIN_ROUTE);
    return null;
  }
  if (status === "loading") {
    return <div className="mb-[100px]"><LoadingCat /></div>;
  }

  function handleScroll() {
    const el = listRef.current;
    if (!el) return;
    // Khi scroll gần tới cuối
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
      loadMore();
    }
  }

  return (
    <section>
      <HeaderCart text="Tài khoản" />
      <div className="grid gap-6 md:grid-cols-3">
        <UserTabs isAdmin={profile?.admin}></UserTabs>

        <div className="col-span-2">
          <ContainerProfileLeft title={`${sTrans("Thông báo")}${unreadCount > 0 ? ` (${unreadCount})` : ""}`} >
            <div className="flex items-center justify-end p-3 border-b">
              {!loading && unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-500 hover:text-blue-700 hover:underline"
                >
                  {sTrans("Đọc tất cả")}
                </button>
              )}
            </div>
            <div ref={listRef}
              onScroll={handleScroll} className={"h-[500px] overflow-y-auto"}>
              {loading && (
                Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonLoadingNotification key={i} hasNotipage={true}/>
                ))
              )}
              {!loading && notifications.length === 0 && <NotFindLayout title='Chúng tôi không có thông báo nào cho bạn vào lúc này.' content='Vui lòng kiểm tra lại sau' className={"mt-4 md:mt-10"} />}
              {!loading && notifications.map(n => (
                <div
                  key={n._id}
                  onClick={() => {
                    markAsRead(n._id); router.push(`${ORDERS_ROUTE}/${n.orderId}?from=orders`);
                  }}
                  className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition ${!n.isRead ? "bg-blue-50" : ""}`}
                >
                  <p className="font-medium ">{n.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                  <p className="mt-1 text-xs text-gray-400 text-end">{timeAgo(n.createdAt,sTrans)}</p>
                </div>
              ))}
              {loadingMore && <p className="p-3 text-xs text-center text-gray-400">{sTrans("Đang tải")}...</p>}
              {!hasMore && notifications.length > 0 && (
                <p className="p-3 text-xs text-center text-gray-400">{sTrans("Đã tải hết")}</p>
              )}

            </div>
          </ContainerProfileLeft>
        </div>
      </div>
    </section>
  )
}
