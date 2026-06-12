import { CartContext } from '@/components/AppContext';
import ButtonPrimary from '@/components/buttons/ButtonPrimary';
import CloseIcon from '@/components/icons/CloseIcon';
import InputCheckbox from '@/components/input/InputCheckbox';
import InputRadio from '@/components/input/InputRadio';
import { RenderTag } from '@/components/menu/RenderTag';
import Image from 'next/image';
import React, { useContext, useEffect, useState } from 'react'

export default function CartProductDetail({ menuItem, showPopup, setShowPopup }) {
    const [selectedSize, setSelectedSize] = useState(menuItem?.size ?? null);
    const [selectedExtras, setSelectedExtras] = useState(menuItem?.extras ?? []);
    const [quantity, setQuantity] = useState(menuItem?.quantity ?? 1);
    const [noteOrder, setNoteOrder] = useState(menuItem?.noteOrder ?? "");
    const [tags, setTags] = useState(menuItem?.tags??[]);

    const { updateCart } = useContext(CartContext);
    useEffect(() => {
        if (showPopup) {
            setSelectedSize(menuItem?.size ?? null);
            setSelectedExtras(menuItem?.extras ?? []);
            setQuantity(menuItem?.quantity ?? 1);
            setNoteOrder(menuItem?.noteOrder ?? "");
            setTags(menuItem?.tags??[]);
        }
    }, [showPopup, menuItem]);

    if (!menuItem) return null;
    const { image, name, description, basePrice, sizes, extraIngredientPrices } = menuItem

    const handleAddToCartButtonClick = async () => {
        const hasOptions = sizes.length > 0 || extraIngredientPrices.length > 0;
        if (hasOptions && !showPopup) {
            setShowPopup(true);
            return;
        }
        updateCart(menuItem, selectedSize, selectedExtras, quantity, noteOrder);
        setShowPopup(false);
    }

    const handleQtyChange = (quantityChange) => {
        const newQuantity = quantity + quantityChange;
        if (newQuantity < 1) return;
        setQuantity(newQuantity);
    }
    const handleExtraThingClick = (extraThing) => {
        const exists = selectedExtras.find(e => e._id === extraThing._id);
        if (exists) {
            setSelectedExtras(prev => prev.filter(e => e._id !== extraThing._id));
        } else {
            setSelectedExtras(prev => [...prev, extraThing]);
        }
    };

    // Choose option will increase the product price 
    // Ex: choose Size (Large,Medium, Small), Extra ingredient(Cheese, Pork,...) => Price Increase (basePrice + selectedPrice + ExtraIngredientPrice)
    let selectedPrice = basePrice;
    if (selectedSize) {
        selectedPrice += selectedSize.price;
    }
    if (selectedExtras?.length > 0) {
        for (const extra of selectedExtras) {
            selectedPrice += extra.price;
        }
    }
    if (quantity >= 1) {
        selectedPrice = selectedPrice * quantity;
    }

    return (
        <div>{showPopup && (
            <div onClick={() => setShowPopup(false)} className="fixed inset-0 z-20 flex items-center justify-center bg-black/80">
                <div onClick={ev => ev.stopPropagation()}
                    className="flex max-w-screen-lg h-[560px] overflow-hidden bg-white rounded-xl relative">
                    <button
                        className="absolute right-5 top-5"
                        onClick={() => setShowPopup(false)}>
                        <CloseIcon />
                    </button>
                    <div className="w-full">
                        <Image src={image} alt={name} width={200} height={200} className="object-cover object-center w-full h-full" />
                    </div>
                    <div className="">
                        <div className="overflow-auto h-[calc(100%-80px)] p-5 w-[570px]">
                            <div>
                                <h3 className="text-2xl leading-[30px] font-semibold break-words">{name}</h3>
                                <p className="mt-2 break-words text-secondary">{description}</p>
                            </div>
                            <div className='flex flex-wrap items-center gap-4 mt-2'>
                                {tags && tags.map((tag, index) => (
                                    <RenderTag key={index} tag={tag} />
                                ))}
                            </div>
                            {sizes?.length > 0 && (
                                <div className="mt-7 ">
                                    <h3 className="font-semibold ">Kích thước</h3>
                                    <div className="flex mt-2 overflow-hidden text-center border rounded-md">
                                        {sizes.map(size => (
                                            <InputRadio key={size._id} name={size.name} onClick={() => setSelectedSize(size)} selectedSize={selectedSize?.name} />
                                        ))}
                                    </div>
                                </div>
                            )}
                            {extraIngredientPrices?.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="font-semibold mb-7">Topping thêm</h3>
                                    {extraIngredientPrices.map(extraThing => {
                                        const sel = selectedExtras.find(e => e._id === extraThing._id);
                                        const isChecked = !!sel;
                                        return (
                                            <InputCheckbox key={extraThing._id} extraThing={extraThing} onClick={() => handleExtraThingClick(extraThing)} isChecked={isChecked} />
                                        )
                                    })}
                                </div>
                            )}
                            <div className="mt-6">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="font-semibold">Ghi chú (tùy chọn)</h3>
                                    <span className="text-sm whitespace-nowrap">{noteOrder?.length}/72</span>
                                </div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        maxLength={72}
                                        placeholder="Chúng tôi sẽ cố gắng hết sức để phục vụ bạn nếu có thể!"
                                        value={noteOrder}
                                        onChange={e => setNoteOrder(e.target.value)}
                                        className="flex-1 w-full px-4 py-3 pr-10 border rounded-lg outline-none focus:border-black"
                                    />
                                    {noteOrder?.length > 0 && <button className="absolute p-[1px] border rounded-full right-3 top-2/4 -translate-y-2/4 cursor-pointer" onClick={() => setNoteOrder("")}><CloseIcon className="w-4 h-4" /></button>}
                                </div>
                            </div>
                        </div>
                        <div className="sticky flex items-center justify-between w-full px-5 bottom-2 gap-9">
                            <div className="flex items-center justify-center gap-6">
                                <button onClick={() => handleQtyChange(-1)}
                                    className="flex items-center justify-center w-10 h-10 text-2xl border rounded-md text-primary">−</button>
                                <span className="w-5 font-medium text-center">{quantity}</span>
                                <button onClick={() => handleQtyChange(1)}
                                    className="flex items-center justify-center w-10 h-10 text-2xl border rounded-md text-primary">+</button>
                            </div>
                            <div
                                className="flex items-center justify-center w-full">
                                <ButtonPrimary onClick={handleAddToCartButtonClick}>
                                    <div
                                        className="text-center text-white"
                                    >
                                        Cập nhật giỏ hàng <span className="inline-block w-2 h-2 mx-2 bg-white rounded-full"></span> {selectedPrice.toLocaleString('vi-VN')} <span className="underline">đ</span>
                                    </div>
                                </ButtonPrimary>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
        </div>
    )
}
