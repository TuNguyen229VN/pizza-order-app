"use client"
import ButtonPrimary from '@/components/buttons/ButtonPrimary';
import NotFindLayout from '@/components/layout/NotFindLayout';
import { API_CATEGORIES, API_COMBO } from '@/constant/constant';
import { HOME_ROUTE } from '@/constant/routesApp';
import HeaderCart from '@/modules/cart/HeaderCart';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'

export default function ComboOrderPage() {
    const { id } = useParams();
    const [combos, setCombos] = useState([])
    const [categories, setCategories] = useState([])
    useEffect(() => {
        fetch(`${API_COMBO}?all=true&status=on`).then(response => {
            response.json().then(items => {
                const item = items.combos.find(i => i._id === id);
                if (item) {
                    console.log(item)
                    setCombos(item);
                }
            })
        })
        fetch(`${API_CATEGORIES}?all=true&statusFilter=on`)
            .then(res => res.json())
            .then(data => setCategories(data.categories))
    }, [id])

    if (!combos || !categories) {
        return <NotFindLayout title='Xin lỗi, không có combo này' />
    }
    return (
        <section>
            <HeaderCart urlLink={HOME_ROUTE} text='' />
            <div className='flex flex-col-reverse mb-4 md:flex-row'>
                <div className='w-full p-4 md:w-1/2 '>
                    <h4 className='mb-4 text-lg font-bold capitalize md:text-3xl'>{combos?.name}</h4>
                    <ul className='pl-5 mb-4 text-sm list-disc'>{combos?.slots
                        ?.map(slot => {
                            const category = categories.find(c => c._id === slot.category)
                            if (!category) return null;
                            return <li key={slot.category}>{String(slot.quantity).padStart(2, "0")} {category.name}</li>
                        }
                        )
                        || "Chưa có"}</ul>
                    <div>
                        <p className='text-sm text-[rgb(55,65,81)]'>Chỉ từ:</p>
                        <p className='font-semibold md:text-2xl'>{combos?.price?.toLocaleString('vi-VN')} <span className='underline'>đ</span></p>
                    </div>
                </div>
                <div className='relative w-full md:w-1/2 md:h-[286px] h-[187px]'>
                    <Image src={combos?.image} alt={combos?.name} fill className='object-cover object-center ' />
                </div>
            </div>
            <div className='px-4'>
                <ButtonPrimary className={"hover:scale-100"}>Bắt đầu</ButtonPrimary>
            </div>
        </section>
    )
}
