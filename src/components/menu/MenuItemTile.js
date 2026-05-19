import React from 'react'
import AddToCartButton from './AddToCartButton';
import Image from 'next/image';
import { useDelivery } from '@/context/DeliveryContext';
import { KEYWORDS } from '@/constant/constant';

export default function MenuItemTile({ onClick, onAddToCart, addToCartRef, addToCartFn, recomStyle, ...item }) {
    const { image, description, name, basePrice,
        sizes, extraIngredientPrices,
    } = item;
    const isPizza = KEYWORDS.some(keyword =>
        name?.toLowerCase().includes(keyword)
    );
    const hasSizesOrExtras = sizes?.length > 1 || extraIngredientPrices?.length > 1;
    const { deliveryInfo } = useDelivery();
    return (
        <div className={`flex h-[156px] md:h-[230px] border md:rounded-2xl cursor-pointer overflow-hidden group transition duration-300 md:hover:shadow-[0_3px_8px_rgba(0,0,0,0.1)] ${recomStyle === "recomStyle" ? "rounded-2xl md:h-[190px] " : ""}`} onClick={(e) => {
            if (e.target.closest('.add-to-cart-zone')) return;
            if (!deliveryInfo) {
                onAddToCart(); // mở modal địa chỉ
                return;
            }
            onClick();
        }}>
            <div className={`${recomStyle === "recomStyle" ? "w-[111px] md:w-[161px]" : "w-[130px]  lg:w-[220px]"} h-full shrink-0 overflow-hidden relative`}>
                {/* <Image src={image} alt={name} width={200} height={200} className='object-cover w-full h-full transition-transform duration-300 group-hover:scale-110' /> */}
                <Image
                    src={image}
                    alt={name}
                    fill
                    className={`transition-transform duration-500 group-hover:scale-110 ${isPizza ? "object-contain scale-[1.4] group-hover:scale-[1.6]" : "object-cover scale-100"} `}
                    style={
                        isPizza ? { objectPosition: "left center", top: recomStyle ? "10%" : "20%", left: recomStyle ? "-20%" : "-30%", } : {}
                    }
                />
            </div>
            <div className='flex flex-col justify-between flex-1 w-full p-4 pl-2'>
                <div>
                    <h4 className={`${recomStyle === "recomStyle" ? "font-medium md:text-xl lg:text-2xl" : "font-semibold"} text-sm md:text-2xl  md:leading-[30px] capitalize text-[#374151] line-clamp-2`}>{name}</h4>
                    {!recomStyle && <p className='text-sm md:text-lg leading-[26px] text-secondary line-clamp-1'>{description}</p>}
                    {/* <div className='px-1 py-[2px] mt-1 text-white rounded bg-primary w-max'>New</div> */}
                </div>
                <div className='flex items-center justify-between w-full'>
                    <div>
                        {hasSizesOrExtras && <p className='text-xs leading-5 md:text-xs text-secondary'>Chỉ từ</p>}
                        <p className={`${recomStyle === "recomStyle" ? "font-medium  md:text-xl lg:text-2xl" : "font-semibold"} mt-1 text-sm md:text-2xl text-[#374151]  md:leading=[30px]`}>{(basePrice + (sizes[0]?.price || 0)).toLocaleString('vi-VN')}<span className='ml-2 underline'>đ</span></p>
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
