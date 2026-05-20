"use client"
import ArrowLeft from '@/components/icons/ArrowLeft'
import UserTabs from '@/components/layout/UserTabs'
import UseProfile from '@/components/UseProfile'
import { COMBO_ROUTE } from '@/constant/routesApp'
import ContainerProfileLeft from '@/container/ContainerProfileLeft'
import HeaderCart from '@/modules/cart/HeaderCart'
import ComboForm from '@/modules/combo/ComboForm'
import Link from 'next/link'
import React, { useState } from 'react'

export default function NewComboPage() {
    const { loading: profileLoading, data: profileData } = UseProfile();
    const [redirectToItems, setRedirectToItems] = useState(false)
    if (redirectToItems) {
        redirect(COMBO_ROUTE);
    }
    if (profileLoading) {
        return "Loading user info...";
    }
    if (!profileData.admin) {
        return "Not an admin";
    }
    return (
        <section className="">
            <HeaderCart text="Tạo combo mới" />
            <div className="grid gap-6 md:grid-cols-3">
                <UserTabs isAdmin={profileData.admin}></UserTabs>
                <div className="relative col-span-2">
                    <ContainerProfileLeft >
                        <Link href={COMBO_ROUTE} className='absolute flex items-center right-4 top-4'><ArrowLeft className='w-5 h-5' /> <span className='ml-1'>Hiển thị danh sách combo</span></Link>
                        <ComboForm setRedirectToItems={setRedirectToItems} />
                    </ContainerProfileLeft>
                </div>
            </div>
        </section>
    )
}
