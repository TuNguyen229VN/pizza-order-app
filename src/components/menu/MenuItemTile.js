import React from 'react'
import AddToCartButton from './AddToCartButton';
import Image from 'next/image';

export default function MenuItemTile({ onClick, onAddToCart, ...item }) {
    const { image, description, name, basePrice,
        sizes, extraIngredientPrices,
    } = item;

    const hasSizesOrExtras = sizes?.length > 0 || extraIngredientPrices?.length > 0;

    return (
        <div className="flex h-[230px] border rounded-2xl cursor-pointer overflow-hidden group transition duration-300 hover:shadow-[0_3px_8px_rgba(0,0,0,0.1)]" onClick={(e) => {
            if (e.target.closest('.add-to-cart-zone')) return;
            onClick(); 
        }}>
            <div className="w-[230px] h-full shrink-0 overflow-hidden">
                <Image src={image} alt={name} width={200} height={200} className='object-cover w-full h-full transition-transform duration-300 group-hover:scale-110' />
            </div>
            <div className='flex flex-col justify-between w-full p-4'>
                <div>
                    <h4 className='text-2xl font-semibold leading-[30px] capitalize text-[#374151]'>{name}</h4>
                    <p className='text-lg leading-[26px] text-secondary line-clamp-1'>{description}</p>
                    {/* <div className='px-1 py-[2px] mt-1 text-white rounded bg-primary w-max'>New</div> */}
                </div>
                <div className='flex items-center justify-between w-full'>
                    <div>
                        <p className='text-xs leading-5 text-secondary'>Chỉ từ</p>
                        <p className='mt-1 text-2xl text-[#374151] font-semibold leading=[30px]'>{basePrice.toLocaleString('vi-VN')}<span className='ml-2 underline'>đ</span></p>
                    </div>
                    <AddToCartButton
                        image={image}
                        hasSizesOrExtras={hasSizesOrExtras}
                        onClick={onAddToCart}
                        basePrice={basePrice}
                        className="add-to-cart-zone"
                    />
                </div>
            </div>
        </div>
    )
}
