import InfoIcon from '@/components/icons/InfoIcon'
import NotificationPopup from '@/components/popup/NotificationPopup'
import { DIVISION_POINT } from '@/constant/constant'
import { useTranslations } from 'next-intl';
import React from 'react'

export default function CartSubtotal({ deliveryFee = 0, subtotal, children, className, discountPercent, discountAmount }) {
    const cTrans = useTranslations("Cart");
    const nTrans = useTranslations("Notification");
    return (
        <div className={`px-4 py-4 border rounded-2xl ${className}`}>
            {children}
            <div className='flex items-center justify-between'>
                <p>{cTrans("Tạm tính")}</p>
                <p className='text-sm font-semibold md:text-base'>{(subtotal).toLocaleString('vi-VN')} <span className='underline'>đ</span></p>
            </div>
            <div className='flex items-center justify-between mt-4'>
                <p className='flex items-center gap-1'>{cTrans("Giảm giá thành viên")} <NotificationPopup labelDesc={nTrans("DISCOUNT_NOTI_DESC")}><InfoIcon /></NotificationPopup></p>
                <p className='font-semibold text-[#0a8020] text-sm md:text-base'>({discountPercent}%) {discountAmount.toLocaleString('vi-VN') || 0} <span className='underline'>đ</span>  </p>
            </div>
            <div className='flex items-center justify-between pb-4 mt-4 border-b'>
                <p className='flex items-center gap-1'>{cTrans("Phí giao hàng")} <NotificationPopup labelDesc={nTrans("DELIVERY_FEE_NOTI_DESC")}><InfoIcon /></NotificationPopup></p>
                <p className='text-sm font-semibold md:text-base'>{deliveryFee.toLocaleString('vi-VN')} <span className='underline'>đ</span></p>
            </div>

            <div className='flex items-center justify-between mt-4'>
                <p>{cTrans("Tổng cộng")}</p>
                <div className='flex flex-col items-end justify-center'>
                    <p className='text-lg md:text-3xl md:leading-[38px] font-bold'>{(subtotal + deliveryFee - (discountAmount || 0)).toLocaleString('vi-VN')} <span className='underline'>đ</span></p>
                    <p className='text-base text-secondary'>{cTrans("Nhận")} <span className='font-semibold text-blackHeader'>{Math.floor((subtotal + deliveryFee) / DIVISION_POINT)} {cTrans("điểm")}</span> Teo rewards</p>
                </div>
            </div>
        </div>
    )
}
