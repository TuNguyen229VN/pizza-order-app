import React, { useState } from 'react'
import AddToCartButton from './AddToCartButton';
import Image from 'next/image';
import { useDelivery } from '@/context/DeliveryContext';
import { KEYWORDS } from '@/constant/constant';
import SkeletonLoadingBox from '../skeleton/SkeletonLoadingBox';
import { RenderTag } from './RenderTag';
import { useTranslations } from 'next-intl';

export default function MenuItemTile({ onClick, onAddToCart, addToCartRef, addToCartFn, recomStyle, ...item }) {
    const { image, description, tags, name, basePrice,
        sizes, extraIngredientPrices,
    } = item;
    const isPizza = KEYWORDS.some(keyword =>
        name?.toLowerCase().includes(keyword)
    );
    const [loadingImage, setLoadingImage] = useState(true)
    const hasSizesOrExtras = sizes?.length > 1 || extraIngredientPrices?.length > 1;
    const { deliveryInfo } = useDelivery();
    const minSizePrice = sizes?.length
        ? Math.min(...sizes.map(size => size.price))
        : 0;
    const sTrans = useTranslations("System");
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
                {loadingImage && <SkeletonLoadingBox className='w-full h-full' />}
                <Image
                    src={image}
                    alt={name}
                    onLoad={() => setLoadingImage(false)}
                    fill
                    className={`transition-transform duration-500 group-hover:scale-110 ${isPizza ? "object-contain scale-[1.4] group-hover:scale-[1.6]" : "object-cover scale-100"} ${loadingImage ? "opacity-0" : "opacity-100"}`}
                    style={
                        isPizza ? { objectPosition: "left center", top: recomStyle ? "10%" : "20%", left: recomStyle ? "-20%" : "-30%", } : {}
                    }
                />
            </div>
            <div className='flex flex-col justify-between flex-1 w-full p-4 pl-2'>
                <div>
                    <h4 className={`${recomStyle === "recomStyle" ? "font-medium md:text-xl lg:text-2xl" : "font-semibold"} text-sm md:text-2xl  md:leading-[30px] capitalize text-[#374151] line-clamp-2`}>{name}</h4>
                    {!recomStyle && <p className='text-sm md:text-lg leading-[26px] text-secondary line-clamp-1'>{description}</p>}
                    <div className='flex flex-wrap items-center gap-4 mt-2'>
                        {tags && tags.map((tag, index) => (
                            <RenderTag key={index} tag={tag} />
                        ))}
                    </div>

                </div>
                <div className='flex items-center justify-between w-full'>
                    <div>
                        {hasSizesOrExtras && <p className='text-xs leading-5 md:text-xs text-secondary'>{sTrans("Chỉ từ")}</p>}
                        <p className={`${recomStyle === "recomStyle" ? "font-medium  md:text-xl lg:text-2xl" : "font-semibold"} mt-1 text-sm md:text-2xl text-[#374151]  md:leading=[30px]`}>{(basePrice + minSizePrice).toLocaleString('vi-VN')}<span className='ml-2 underline'>đ</span></p>
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
