import React from 'react'
import AddToCartButton from './AddToCartButton';
import Image from 'next/image';
import { useDelivery } from '@/context/DeliveryContext';

export default function MenuItemTile({ onClick, onAddToCart, addToCartRef, addToCartFn, ...item }) {
    const { image, description, name, basePrice,
        sizes, extraIngredientPrices,
    } = item;
    const isPizza = name?.toLowerCase().includes("pizza");
    const hasSizesOrExtras = sizes?.length > 1 || extraIngredientPrices?.length > 1;
    const { deliveryInfo } = useDelivery();
    return (
        <div className="flex h-[230px] border rounded-2xl cursor-pointer overflow-hidden group transition duration-300 hover:shadow-[0_3px_8px_rgba(0,0,0,0.1)]" onClick={(e) => {
            if (e.target.closest('.add-to-cart-zone')) return;
            if (!deliveryInfo) {
                onAddToCart(); // mở modal địa chỉ
                return;
            }
            onClick();
        }}>
            <div className="w-[220px] h-full shrink-0 overflow-hidden relative">
                {/* <Image src={image} alt={name} width={200} height={200} className='object-cover w-full h-full transition-transform duration-300 group-hover:scale-110' /> */}
                <Image
                    src={image}
                    alt={name}
                    fill
                    className={`transition-transform duration-500 group-hover:scale-110 ${isPizza ? "object-contain scale-[1.4] group-hover:scale-[1.6]" : "object-cover scale-100"} `}
                    style={
                        isPizza ? { objectPosition: "left center", top: "20%", left: "-30%", } : {}
                    }
                />
            </div>
            <div className='flex flex-col justify-between flex-1 w-full p-4 pl-2'>
                <div>
                    <h4 className='text-2xl font-semibold leading-[30px] capitalize text-[#374151]'>{name}</h4>
                    <p className='text-lg leading-[26px] text-secondary line-clamp-1'>{description}</p>
                    {/* <div className='px-1 py-[2px] mt-1 text-white rounded bg-primary w-max'>New</div> */}
                </div>
                <div className='flex items-center justify-between w-full'>
                    <div>
                        <p className='text-xs leading-5 text-secondary'>Chỉ từ</p>
                        <p className='mt-1 text-2xl text-[#374151] font-semibold leading=[30px]'>{(basePrice + (sizes[0]?.price || 0)).toLocaleString('vi-VN')}<span className='ml-2 underline'>đ</span></p>
                    </div>
                    <AddToCartButton
                        ref={addToCartRef}
                        image={image}
                        hasSizesOrExtras={hasSizesOrExtras}
                        onClick={onAddToCart}         
                        onAddToCart={addToCartFn}    
                        basePrice={basePrice}
                        className="add-to-cart-zone"
                    />
                </div>
            </div>
        </div>
    )
}
