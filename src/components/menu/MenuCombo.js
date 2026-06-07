import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import PlusIcon from '../icons/PlusIcon'
import ButtonAdd from '../buttons/ButtonAdd'
import { COMBO_ORDER_ROUTE } from '@/constant/routesApp'
import { useDelivery } from '@/context/DeliveryContext'

export default function MenuCombo({ categories, ...item }) {
    const { _id, image, name, price, slots } = item;
    const { deliveryInfo, openDeliveryModal } = useDelivery();
    return (
        <Link href={`${COMBO_ORDER_ROUTE}/${_id}`} onClick={(e) => {
            if (!deliveryInfo) {
                e.preventDefault();
                openDeliveryModal();
                return;
            }
        }} className={`flex flex-row h-[132px] md:h-full border rounded-2xl cursor-pointer overflow-hidden group transition duration-300 md:hover:shadow-[0_3px_8px_rgba(0,0,0,0.1)] md:flex-col }`}>
            <div className='relative h-full md:h-[285px] w-[130px] md:w-full overflow-hidden bg-red-500 shrink-0'>
                <Image src={image} alt={name} fill quality={100} className='object-fill object-center w-full h-full transition-transform duration-500 md:object-cover group-hover:scale-105' />
            </div>
            <div className='flex flex-col justify-center w-full gap-2 p-2 md:p-4'>
                <h4 className='text-sm capitalize text-[#374151]  md:text-[28px] font-semibold md:leading-[40px]'>{name}</h4>
                <div className='relative flex flex-col-reverse gap-2 md:flex-col'>
                    <div className='text-sm md:text-lg text-secondary'><span className='block mb-1 text-xs md:text-lg md:mb-0 md:inline'>Chỉ từ</span> <span className='font-semibold text-[#374151] '>{price?.toLocaleString('vi-VN')}</span> <span className='font-semibold underline text-[#374151] '>đ</span></div>
                    <p className='text-sm line-clamp-1 md:text-lg text-secondary'>{slots
                        ?.map(slot => {
                            const category = categories.find(c => c._id === slot.category)
                            if (!category) return null;
                            return `${String(slot.quantity).padStart(2, "0")} ${category.name} ${slot?.size ? `(${slot.size.name.toLowerCase()})` : ''}`
                        }
                        )
                        .filter(Boolean)
                        .join(", ") || "Chưa có"}</p>
                    <ButtonAdd className={"md:hidden block absolute bottom-0 right-0"} />
                </div>
            </div>
        </Link>
    )
}
