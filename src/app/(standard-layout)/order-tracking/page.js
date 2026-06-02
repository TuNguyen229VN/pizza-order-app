"use client"
import ButtonPrimary from '@/components/buttons/ButtonPrimary'
import CloseIcon from '@/components/icons/CloseIcon'
import HeaderCart from '@/modules/cart/HeaderCart'
import React, { useState } from 'react'

export default function OrderTrackingPage() {
  const [searching, setSearching] = useState("")
  return (
    <section>
      <HeaderCart text="Theo dõi đơn hàng" />
      <div className="w-full p-4 mx-auto mt-0 bg-white md:border md:rounded-2xl md:p-6 md:w-1/2 md:mt-4">
        <p className="mb-4 text-sm text-center text-secondary">Chỉ áp dụng cho đơn hàng giao hàng</p>
        <div className="flex flex-col w-full gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
          <input
            type="text"
            maxLength={72}
            placeholder="Nhập số điện thoại hoặc mã đơn hàng"
            value={searching}
            onChange={e => setSearching(e.target.value)}
            className="flex-1 w-full px-4 py-3 pr-10 border rounded-lg outline-none focus:border-black"
          />
          {searching?.length > 0 && <button className="absolute p-[1px] border rounded-full right-3 top-2/4 -translate-y-2/4 cursor-pointer" onClick={() => setSearching("")}><CloseIcon className="w-4 h-4" /></button>}
        </div>
        <ButtonPrimary className={"md:w-max p-4"}><p>Tìm kiếm</p></ButtonPrimary>
        </div>
      </div>
    </section>
  )
}
