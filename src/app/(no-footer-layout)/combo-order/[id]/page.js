"use client"
import ButtonPrimary from '@/components/buttons/ButtonPrimary';
import FlyingButton from '@/components/buttons/FlyingButton';
import NotFindLayout from '@/components/layout/NotFindLayout';
import { API_CATEGORIES, API_COMBO } from '@/constant/constant';
import { HOME_ROUTE } from '@/constant/routesApp';
import { useDelivery } from '@/context/DeliveryContext';
import HeaderCart from '@/modules/cart/HeaderCart';
import ComboChoosedList from '@/modules/combo-order/ComboChoosedList';
import ComboNote from '@/modules/combo-order/ComboNote';
import ComboQuantity from '@/modules/combo-order/ComboQuantity';
import ComboSelector from '@/modules/combo-order/ComboSelector';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react'

export default function ComboOrderPage() {
    const { id } = useParams();
    const [comboChooseList, setComboChooseList] = useState([]);
    const [combos, setCombos] = useState(null);
    const [categories, setCategories] = useState(null);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const { deliveryInfo, openDeliveryModal } = useDelivery();
    const [noteOrder, setNoteOrder] = useState("");
    const [quantity, setQuantity] = useState(1);

    const flyingBtnRef = useRef(null);
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

    const handleQtyChange = (quantityChange) => {
        const newQuantity = quantity + quantityChange;
        if (newQuantity < 1) return;
        setQuantity(newQuantity);
    }
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
                    <div className='flex flex-col gap-2 md:items-center md:gap-32 md:flex-row'>
                        <div>
                            <p className='text-sm text-[rgb(55,65,81)]'>Chỉ từ:</p>
                            <p className='font-semibold md:text-2xl'>{combos?.price?.toLocaleString('vi-VN')} <span className='underline'>đ</span></p>
                        </div>
                        {deliveryInfo?.shipFee && (
                            <div>
                                <p className='text-sm text-[rgb(55,65,81)]'>Chi phí giao hàng:</p>
                                <p className='font-semibold md:text-2xl'>{deliveryInfo.shipFee?.toLocaleString('vi-VN')} <span className='underline'>đ</span></p>
                            </div>
                        )}
                    </div>
                </div>
                <div className='relative w-full md:w-1/2 md:h-[286px] h-[187px]'>
                    <Image src={combos?.image} alt={combos?.name} fill className='object-cover object-center ' sizes="(max-width: 768px) 100vw, 50vw" quality={90} />
                </div>
            </div>
            {open && <ComboSelector comboChooseList={comboChooseList} setComboChooseList={setComboChooseList} categories={categories} combo={combos} onClose={() => setOpen(false)} />}
            {comboChooseList.length === 0 && (
                <div className='px-4'>
                    <ButtonPrimary className={"hover:scale-100"} onClick={() => setOpen(true)}>Bắt đầu</ButtonPrimary>
                </div>
            )}
            {comboChooseList.length > 0 && (
                <>
                    <ComboChoosedList comboChooseList={comboChooseList} onClick={() => setOpen(true)} />
                    <ComboNote noteOrder={noteOrder} setNoteOrder={setNoteOrder} />
                    <ComboQuantity quantity={quantity} handleQtyChange={handleQtyChange} />
                    <div className='px-4 md:px-0'>
                        <FlyingButton className={"w-full"} ref={flyingBtnRef} targetTop={'6%'}
                            targetLeft={'80%'} src={combos?.image} onClick={()=>{console.log("Add to cart") }}>
                            <ButtonPrimary className={"mb-4"}>
                                <div className="mb-4 text-center text-white">
                                    Thêm vào giỏ hàng{" "}
                                    <span className="inline-block w-2 h-2 mx-2 bg-white rounded-full" />{" "}
                                    {combos?.price?.toLocaleString('vi-VN')} <span className="underline">đ</span>
                                </div>
                            </ButtonPrimary>
                        </FlyingButton>
                    </div>
                </>
            )}
        </section>
    )
}
