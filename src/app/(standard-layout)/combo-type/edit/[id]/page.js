"use client"
import ArrowLeft from '@/components/icons/ArrowLeft'
import UserTabs from '@/components/layout/UserTabs'
import UseProfile from '@/components/UseProfile'
import { API_COMBO_TYPES } from '@/constant/constant'
import { COMBOTYPE_ROUTE } from '@/constant/routesApp'
import ContainerProfileLeft from '@/container/ContainerProfileLeft'
import HeaderCart from '@/modules/cart/HeaderCart'
import ComboTypeForm from '@/modules/combo-type/ComboTypeForm'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

export default function EditComboTypePage() {
  const { id } = useParams();
  const { loading: profileLoading, data: profileData } = UseProfile();
  const [redirectToItems, setRedirectToItems] = useState(false)
  const [comboType, setComboType] = useState(null)
  useEffect(() => {
    fetch(`${API_COMBO_TYPES}?all=true`).then(response => {
      response.json().then(items => {
        const item = items.comboTypes.find(i => i._id === id);
        if (item) {
          setComboType(item);
        }
      })
    })

  }, [id])

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
      <HeaderCart text="Cập nhật loại combo" />
      <div className="grid gap-6 md:grid-cols-3">
        <UserTabs isAdmin={profileData.admin}></UserTabs>
        <div className="relative col-span-2">
          <ContainerProfileLeft >
            <Link href={COMBOTYPE_ROUTE} className='absolute flex items-center right-4 top-4'><ArrowLeft className='w-5 h-5' /> <span className='ml-1'>Hiển thị tất cả loại combo</span></Link>
            <ComboTypeForm editData={comboType}/>
          </ContainerProfileLeft>
        </div>
      </div>
    </section>
  )
}
