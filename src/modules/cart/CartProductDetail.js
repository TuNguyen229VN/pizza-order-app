import { CartContext } from '@/components/AppContext';
import ButtonPrimary from '@/components/buttons/ButtonPrimary';
import CloseIcon from '@/components/icons/CloseIcon';
import InputCheckbox from '@/components/input/InputCheckbox';
import InputRadio from '@/components/input/InputRadio';
import { RenderTag } from '@/components/menu/RenderTag';
import SkeletonLoadingBox from '@/components/skeleton/SkeletonLoadingBox';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React, { useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function CartProductDetail({ menuItem, showPopup, setShowPopup }) {
    const [loadingImage, setLoadingImage] = useState(true);
    const [selectedSize, setSelectedSize] = useState(menuItem?.size ?? null);
    const [selectedExtras, setSelectedExtras] = useState(menuItem?.extras ?? []);
    const [quantity, setQuantity] = useState(menuItem?.quantity ?? 1);
    const [noteOrder, setNoteOrder] = useState(menuItem?.noteOrder ?? "");
    const [tags, setTags] = useState(menuItem?.tags ?? []);
    const [mounted, setMounted] = useState(false);
    const sTrans = useTranslations("System");
    const { updateCart } = useContext(CartContext);

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        if (showPopup) {
            setSelectedSize(menuItem?.size ?? null);
            setSelectedExtras(menuItem?.extras ?? []);
            setQuantity(menuItem?.quantity ?? 1);
            setNoteOrder(menuItem?.noteOrder ?? "");
            setTags(menuItem?.tags ?? []);
        }
    }, [showPopup, menuItem]);

    if (!menuItem) return null;
    const { image, name, description, basePrice, sizes, extraIngredientPrices } = menuItem;

    const handleAddToCartButtonClick = async () => {
        const hasOptions = sizes.length > 0 || extraIngredientPrices.length > 0;
        if (hasOptions && !showPopup) {
            setShowPopup(true);
            return;
        }
        updateCart(menuItem, selectedSize, selectedExtras, quantity, noteOrder);
        setShowPopup(false);
    };

    const handleQtyChange = (quantityChange) => {
        const newQuantity = quantity + quantityChange;
        if (newQuantity < 1) return;
        setQuantity(newQuantity);
    };

    const handleExtraThingClick = (extraThing) => {
        const exists = selectedExtras.find(e => e._id === extraThing._id);
        if (exists) {
            setSelectedExtras(prev => prev.filter(e => e._id !== extraThing._id));
        } else {
            setSelectedExtras(prev => [...prev, extraThing]);
        }
    };

    let selectedPrice = basePrice;
    if (selectedSize) selectedPrice += selectedSize.price;
    for (const extra of selectedExtras ?? []) selectedPrice += extra.price;
    if (quantity >= 1) selectedPrice = selectedPrice * quantity;

    if (!mounted || !showPopup) return null;

    return createPortal(
        <div
            onClick={() => setShowPopup(false)}
            className="fixed inset-0 z-50 flex justify-center md:items-center bg-black/80"
        >
            <div
                onClick={ev => ev.stopPropagation()}
                className="relative flex flex-col md:flex-row w-full md:w-auto md:max-w-screen-lg
                           h-full md:h-[560px] overflow-hidden bg-white rounded-0 md:rounded-xl"
            >
                <button
                    className="absolute z-10 p-1 bg-white rounded-full right-3 top-3 md:right-5 md:top-5"
                    onClick={() => setShowPopup(false)}
                >
                    <CloseIcon />
                </button>

                <div className="flex-shrink-0 h-[280px] md:w-1/2 md:h-full">
                    {loadingImage && <SkeletonLoadingBox className='w-full h-full' />}
                    <Image
                        src={image}
                        alt={name}
                        width={400}
                        height={400}
                        onLoad={() => setLoadingImage(false)}
                        className={`object-cover object-center w-full h-full ${loadingImage ? "opacity-0" : "opacity-100"}`}
                    />
                </div>

                <div className="flex flex-col flex-1 w-full min-h-0 md:w-[570px]">
                    <div className="flex-1 min-h-0 px-5 py-3 overflow-y-auto md:py-5">
                        <div>
                            <h3 className="text-base md:text-2xl leading-[30px] font-semibold break-words pr-8">{name}</h3>
                            <p className="mt-2 text-sm break-words md:text-base text-secondary">{description}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 mt-2">
                            {tags && tags.map((tag, index) => (
                                <RenderTag key={index} tag={tag} haveName={true} />
                            ))}
                        </div>

                        {sizes?.length > 0 && (
                            <div className="mt-7">
                                <h3 className="font-semibold">{sTrans("Kích thước")}</h3>
                                <div className="flex mt-2 overflow-hidden text-center border rounded-md">
                                    {sizes.map(size => (
                                        <InputRadio key={size._id} name={size.name} onClick={() => setSelectedSize(size)} selectedSize={selectedSize?.name} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {extraIngredientPrices?.length > 0 && (
                            <div className="mt-6">
                                <h3 className="font-semibold mb-7">{sTrans("Topping thêm")}</h3>
                                {extraIngredientPrices.map(extraThing => {
                                    const isChecked = !!selectedExtras.find(e => e._id === extraThing._id);
                                    return (
                                        <InputCheckbox key={extraThing._id} extraThing={extraThing} onClick={() => handleExtraThingClick(extraThing)} isChecked={isChecked} />
                                    );
                                })}
                            </div>
                        )}

                        <div className="mt-6">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="font-semibold">{sTrans("Ghi chú")} ({sTrans("tùy chọn")})</h3>
                                <span className="text-sm whitespace-nowrap">{noteOrder?.length}/72</span>
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    maxLength={72}
                                    placeholder={sTrans("PLACEHOLDER_NOTES")}
                                    value={noteOrder}
                                    onChange={e => setNoteOrder(e.target.value)}
                                    className="flex-1 w-full px-4 py-3 pr-10 border rounded-lg outline-none focus:border-black"
                                />
                                {noteOrder?.length > 0 && (
                                    <button
                                        className="absolute p-[1px] border rounded-full right-3 top-2/4 -translate-y-2/4 cursor-pointer"
                                        onClick={() => setNoteOrder("")}
                                    >
                                        <CloseIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-between gap-4 px-5 py-3 bg-white border-t md:flex-row md:gap-9">
                        <div className="flex items-center justify-center gap-3 md:gap-6">
                            <button onClick={() => handleQtyChange(-1)}
                                className="flex items-center justify-center w-10 h-10 text-2xl border rounded-md text-primary">−</button>
                            <span className="w-5 font-medium text-center">{quantity}</span>
                            <button onClick={() => handleQtyChange(1)}
                                className="flex items-center justify-center w-10 h-10 text-2xl border rounded-md text-primary">+</button>
                        </div>
                        <div className="flex items-center justify-center flex-1 w-full">
                            <ButtonPrimary onClick={handleAddToCartButtonClick}>
                                <div className="text-sm text-center text-white md:text-base whitespace-nowrap">
                                    {sTrans("Cập nhật giỏ hàng")} <span className="inline-block w-2 h-2 mx-2 bg-white rounded-full"></span> {selectedPrice.toLocaleString('vi-VN')} <span className="underline">đ</span>
                                </div>
                            </ButtonPrimary>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}