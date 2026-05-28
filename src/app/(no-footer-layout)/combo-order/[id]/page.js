"use client"
import ButtonPrimary from '@/components/buttons/ButtonPrimary';
import NotFindLayout from '@/components/layout/NotFindLayout';
import { API_CATEGORIES, API_COMBO } from '@/constant/constant';
import { HOME_ROUTE } from '@/constant/routesApp';
import HeaderCart from '@/modules/cart/HeaderCart';
import ComboSelector from '@/modules/combo/ComboSelector';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'

export default function ComboOrderPage() {
    const { id } = useParams();
    const [combos, setCombos] = useState(null);
    const [categories, setCategories] = useState(null);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        setLoading(true);

        Promise.all([
            fetch(`${API_COMBO}?all=true&status=on`)
                .then(res => res.json()),

            fetch(`${API_CATEGORIES}?all=true&statusFilter=on`)
                .then(res => res.json())
        ])
            .then(([comboData, categoryData]) => {

                const item = comboData.combos.find(i => i._id === id);

                setCombos(item || null);
                setCategories(categoryData.categories || []);
            })
            .catch(() => {
                setCombos(null);
                setCategories(null);
            })
            .finally(() => {
                setLoading(false);
            });

    }, [id]);
    if (loading) {
        return <div>Loading...</div>
    }
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
                        <p className='text-sm text-[rgb(55,65,81)]'>Chỉ từ:test</p>
                        <p className='font-semibold md:text-2xl'>{combos?.price?.toLocaleString('vi-VN')} <span className='underline'>đ</span></p>
                    </div>
                </div>
                <div className='relative w-full md:w-1/2 md:h-[286px] h-[187px]'>
                    <Image src={combos?.image} alt={combos?.name} fill className='object-cover object-center ' />
                </div>
            </div>
            {open && <ComboSelector categories={categories} combo={combos} onClose={() => setOpen(false)} />}
            <div className='px-4'>
                <ButtonPrimary className={"hover:scale-100"} onClick={() => setOpen(true)}>Bắt đầu</ButtonPrimary>
            </div>
        </section>
    )
}
