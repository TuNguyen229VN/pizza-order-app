"use client"
import ArrowLeft from '@/components/icons/ArrowLeft'
import UserTabs from '@/components/layout/UserTabs'
import LoadingCat from '@/components/loading/LoadingCat'
import ConfirmPopup from '@/components/popup/ConfirmPopup'
import UseProfile from '@/components/UseProfile'
import { API_COMBO_TYPES } from '@/constant/constant'
import { COMBOTYPE_ROUTE } from '@/constant/routesApp'
import ContainerProfileLeft from '@/container/ContainerProfileLeft'
import HeaderCart from '@/modules/cart/HeaderCart'
import ComboTypeForm from '@/modules/combo-type/ComboTypeForm'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { redirect, useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function EditComboTypePage() {
  const { id } = useParams();
  const sTrans = useTranslations("System");
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

  const handleDeleteClick = async () => {
    const promise = new Promise(async (resolve, reject) => {
      const response = await fetch(`${API_COMBO_TYPES}?_id=${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        resolve();
      } else {
        reject();
      }
      await toast.promise(promise, {
        loading: sTrans("Đang xóa"),
        success: sTrans("Đã xóa"),
        error: sTrans("Lỗi"),
      });
      setRedirectToItems(true);
    })
  }

  if (redirectToItems) {
    redirect(COMBOTYPE_ROUTE);
  }
  if (profileLoading) {
    return <div className="mb-[100px]"><LoadingCat /></div>;
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
            <Link href={COMBOTYPE_ROUTE} className='absolute flex items-center right-4 top-4'><ArrowLeft className='w-5 h-5' /> <span className='ml-1'>{sTrans("Hiển thị tất cả loại combo")}</span></Link>
            <ComboTypeForm editData={comboType} />
            <div className='flex items-center justify-center w-full p-4 mt-6 text-lg font-medium rounded-lg hover:bg-gray-200'>
              <ConfirmPopup onDelete={handleDeleteClick} label='Xóa loại combo' classNameButton='w-full'>
                <p >{sTrans("Xóa loại combo")}</p>
              </ConfirmPopup>
            </div>
          </ContainerProfileLeft>
        </div>
      </div>
    </section>
  )
}
