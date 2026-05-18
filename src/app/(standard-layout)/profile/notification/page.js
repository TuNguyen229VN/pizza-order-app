"use client"
import NotFindLayout from '@/components/layout/NotFindLayout';
import UserTabs from '@/components/layout/UserTabs';
import UseProfile from '@/components/UseProfile';
import ContainerProfileLeft from '@/container/ContainerProfileLeft';
import HeaderCart from '@/modules/cart/HeaderCart';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React from 'react'

export default function NotificationPage() {
  const session = useSession();
  const router = useRouter();
  const { status, data } = session;
  const { loading, data: profile } = UseProfile();
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
          <ContainerProfileLeft title={"Thông báo"}>
            <NotFindLayout title='Chúng tôi không có thông báo nào cho bạn vào lúc này.' content='Vui lòng kiểm tra lại sau' className={"mt-4 md:mt-10"}/>
          </ContainerProfileLeft>
        </div>
      </div>
    </section>
  )
}
