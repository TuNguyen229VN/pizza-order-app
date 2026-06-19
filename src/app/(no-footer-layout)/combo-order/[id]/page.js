"use client"
import { CartContext } from '@/components/AppContext';
import ButtonPrimary from '@/components/buttons/ButtonPrimary';
import FlyingButton from '@/components/buttons/FlyingButton';
import NotFindLayout from '@/components/layout/NotFindLayout';
import LoadingCat from '@/components/loading/LoadingCat';
import SkeletonLoadingBox from '@/components/skeleton/SkeletonLoadingBox';
import { API_CATEGORIES, API_COMBO, API_MENU_ITEMS } from '@/constant/constant';
import { HOME_ROUTE } from '@/constant/routesApp';
import { useDelivery } from '@/context/DeliveryContext';
import HeaderCart from '@/modules/cart/HeaderCart';
import ComboChoosedList from '@/modules/combo-order/ComboChoosedList';
import ComboNote from '@/modules/combo-order/ComboNote';
import ComboQuantity from '@/modules/combo-order/ComboQuantity';
import ComboSelector from '@/modules/combo-order/ComboSelector';
import { getLabel } from '@/utils/i18n-utils';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import React, { useContext, useEffect, useRef, useState } from 'react'

export default function ComboOrderPage() {
    const router = useRouter();
    const { id } = useParams();
    const searchParams = useSearchParams();
    const sTrans = useTranslations("System");
    const hTrans = useTranslations("HomePage");
    const comboCartId = searchParams.get("cartComboId");
    const { addComboToCart, updateComboInCart, cartProducts } = useContext(CartContext);
    const [comboChooseList, setComboChooseList] = useState([]);
    const [combos, setCombos] = useState(null);
    const [menuItems, setMenuItems] = useState(null)
    const [categories, setCategories] = useState(null);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const { deliveryInfo, openDeliveryModal } = useDelivery();
    const [noteOrder, setNoteOrder] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [chooseTabIndex, setChooseTabIndex] = useState(0);
    const flyingBtnRef = useRef(null);
    const [shouldFly, setShouldFly] = useState(false);

    const [loadingImage, setLoadingImage] = useState(true);
    useEffect(() => {
        if (comboCartId) {
            const item = cartProducts.find(combo => combo.cartComboId === comboCartId);
            if (item) {
                setComboChooseList(item.slots);
                setQuantity(item.quantity);
                setNoteOrder(item.noteOrder);
            }
        }
    }, [comboCartId, cartProducts]);

    useEffect(() => {
        if (shouldFly && flyingBtnRef.current) {
            flyingBtnRef.current.triggerFly();
            setShouldFly(false);
        }
    }, [shouldFly]);

    useEffect(() => {
        setLoading(true);

        Promise.all([
            fetch(`${API_COMBO}?all=true&status=on`)
                .then(res => res.json()),
            fetch(`${API_MENU_ITEMS}?all=true&status=on`)
                .then(res => res.json()),
            fetch(`${API_CATEGORIES}?all=true&statusFilter=on`)
                .then(res => res.json())
        ])
            .then(([comboData, menuItemData, categoryData]) => {

                const item = comboData.combos.find(i => i._id === id);

                setCombos(item || null);
                setMenuItems(menuItemData.menuItems || []);
                setCategories(categoryData.categories || []);
            })
            .catch(() => {
                setCombos(null);
                setMenuItems(null);
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

    function handleSubmit() {
        if (!deliveryInfo) {
            openDeliveryModal();
            return;
        }
        if (quantity < 1) return;
        if (comboChooseList.reduce((sum, item) => sum + item.quantity, 0) !== combos.slots.reduce((sum, item) => sum + item.quantity, 0)) {
            const firstIncompleteSlot = combos.slots.findIndex((slot, idx) => {
                const selectedQty = comboChooseList
                    .filter(item => item.slotIndex === idx)
                    .reduce((sum, item) => sum + item.quantity, 0);

                return selectedQty < slot.quantity;
            });

            setChooseTabIndex(firstIncompleteSlot);
            setOpen(true);
            return;
        }
        if (comboCartId) {
            updateComboInCart(comboCartId, comboChooseList, quantity, noteOrder);
            router.back();
            return;
        }

        setShouldFly(true);
        router.push(HOME_ROUTE); // quay về trang chủ để thấy hiệu ứng bay, đồng thời có thể tiếp tục mua sắm
    }

    if (loading) {
        return <div className="mb-[100px]"> <LoadingCat /></div>
    }
    if (!combos || !categories) {
        return <NotFindLayout title={sTrans("COMBO_NOTFOUND_SEARCH")} />
    }
    return (
        <section>
            <HeaderCart urlLink={HOME_ROUTE} text='' />

            <div className='flex flex-col-reverse mb-4 md:flex-row'>
                <div className='w-full p-4 md:w-1/2 '>
                    <h4 className='mb-4 text-lg font-bold capitalize md:text-3xl'>{getLabel(hTrans,combos?.name)}</h4>
                    <ul className='pl-5 mb-4 text-sm list-disc'>
                        {combos?.slots
                            ?.map((slot, index) => {
                                const category = categories.find(c => c._id === slot.category);
                                if (!category) return null;

                                const qty = String(slot.quantity).padStart(2, "0");
                                const sizeText = slot?.size ? ` (${getLabel(hTrans,slot.size.name).toLowerCase()})` : '';

                                if (slot.label) return <li key={`${slot.category}-${index}`}>{getLabel(hTrans,slot.label)}</li>;

                                if (slot?.size) return <li key={`${slot.category}-${index}`}>{qty} {getLabel(hTrans,category.name)}{getLabel(hTrans,sizeText)}</li>;

                                if (slot.allowedItems?.length) {
                                    const allowed = menuItems?.filter(mi =>
                                        slot.allowedItems.includes(mi._id)
                                    ) || [];
                                    const allInCategory = menuItems?.filter(mi =>
                                        (mi.category?._id || mi.category) === slot.category
                                    ) || [];
                                    const isSelectAll = allInCategory.length > 0 && allowed.length === allInCategory.length;

                                    if (!isSelectAll && allowed.length > 0) {
                                        return <li key={`${slot.category}-${index}`}>{qty} {allowed.map(mi => getLabel(hTrans,mi.name)).join(" / ")}</li>;
                                    }
                                }

                                return <li key={`${slot.category}-${index}`}>{qty} {getLabel(hTrans,category.name)}</li>;
                            })
                            .filter(Boolean)
                            || <li>{sTrans("Chưa có")}</li>}
                    </ul>
                    <div className='flex flex-col gap-2 md:items-center md:gap-32 md:flex-row'>
                        <div>
                            <p className='text-sm text-[rgb(55,65,81)]'>{sTrans("Chỉ từ")}:</p>
                            <p className='font-semibold md:text-2xl'>{combos?.price?.toLocaleString('vi-VN')} <span className='underline'>đ</span></p>
                        </div>
                        {deliveryInfo?.shipFee && (
                            <div>
                                <p className='text-sm text-[rgb(55,65,81)]'>{sTrans("Chi phí giao hàng")}:</p>
                                <p className='font-semibold md:text-2xl'>{deliveryInfo.shipFee?.toLocaleString('vi-VN')} <span className='underline'>đ</span></p>
                            </div>
                        )}
                    </div>
                </div>
                <div className='relative w-full md:w-1/2 md:h-[286px] h-[187px]'>
                    {loadingImage && <SkeletonLoadingBox className='w-full h-full' />}
                    <Image onLoad={() => setLoadingImage(false)} src={combos?.image} alt={combos?.name} fill className={`object-cover object-center w-full h-full ${loadingImage ? "opacity-0" : "opacity-100"}`} sizes="(max-width: 768px) 100vw, 50vw" quality={90} />
                </div>
            </div>
            {open && <ComboSelector mode={comboCartId ? "edit" : "add"} chooseTabIndex={chooseTabIndex} setChooseTabIndex={setChooseTabIndex} comboChooseList={comboChooseList} setComboChooseList={setComboChooseList} categories={categories} combo={combos} onClose={() => {
                setOpen(false);
                setChooseTabIndex(0);
            }} />}
            {comboChooseList.length === 0 && (
                <div className='px-4'>
                    <ButtonPrimary className={"hover:scale-100"} onClick={() => setOpen(true)}>{sTrans("Bắt đầu")}</ButtonPrimary>
                </div>
            )}
            {comboChooseList.length > 0 && (
                <>
                    <ComboChoosedList chooseTabIndex={chooseTabIndex} setChooseTabIndex={setChooseTabIndex} combos={combos} categories={categories} comboChooseList={comboChooseList} onClick={() => setOpen(true)} />
                    <ComboNote noteOrder={noteOrder} setNoteOrder={setNoteOrder} />
                    <ComboQuantity quantity={quantity} handleQtyChange={handleQtyChange} />
                    <div className='px-4 md:px-0'>
                        <FlyingButton
                            ref={flyingBtnRef}
                            className={"w-full"}
                            targetTop={'6%'}
                            targetLeft={'80%'}
                            src={combos?.image}
                            onClick={() => addComboToCart(combos, comboChooseList, quantity, noteOrder)}
                        >
                            <ButtonPrimary
                                className={"mb-4"}
                                onClick={(e) => { e.stopPropagation(); handleSubmit(); }}
                            >
                                <div className="mb-4 text-center text-white">
                                    {comboCartId ? sTrans("Cập nhật giỏ hàng") : sTrans("Thêm vào giỏ hàng")}{" "}
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
