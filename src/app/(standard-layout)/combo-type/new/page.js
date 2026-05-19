"use client"
import ArrowLeft from '@/components/icons/ArrowLeft'
import UserTabs from '@/components/layout/UserTabs'
import UseProfile from '@/components/UseProfile'
import { COMBOTYPE_ROUTE } from '@/constant/routesApp'
import ContainerProfileLeft from '@/container/ContainerProfileLeft'
import HeaderCart from '@/modules/cart/HeaderCart'
import Link from 'next/link'
import React, { useState } from 'react'
import ComboTypeForm from '@/modules/combo-type/ComboTypeForm'
import { redirect } from 'next/navigation'

export default function NewComboTypePage() {
    const { loading: profileLoading, data: profileData } = UseProfile();
    const [redirectToItems, setRedirectToItems] = useState(false)
    if (redirectToItems) {
        redirect(COMBOTYPE_ROUTE);
    }
    if (profileLoading) {
        return "Loading user info...";
    }
    if (!profileData.admin) {
        return "Not an admin";
    }
    return (
        <section className="">
            <HeaderCart text="Tạo loại combo mới" />
            <div className="grid gap-6 md:grid-cols-3">
                <UserTabs isAdmin={profileData.admin}></UserTabs>
                <div className="relative col-span-2">
                    <ContainerProfileLeft >
                        <Link href={COMBOTYPE_ROUTE} className='absolute flex items-center right-4 top-4'><ArrowLeft className='w-5 h-5' /> <span className='ml-1'>Hiển thị tất cả loại combo</span></Link>
                        <ComboTypeForm setRedirectToItems={setRedirectToItems}/>
                    </ContainerProfileLeft>
                </div>
            </div>
        </section>
    )
}
