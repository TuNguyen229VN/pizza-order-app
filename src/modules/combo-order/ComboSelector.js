"use client";
import { CartContext } from "@/components/AppContext";
import ButtonAdd from "@/components/buttons/ButtonAdd";
import ButtonDecrement from "@/components/buttons/ButtonDecrement";
import ButtonIncrement from "@/components/buttons/ButtonIncrement";
import ButtonPrimary from "@/components/buttons/ButtonPrimary";
import MenuItemTile from "@/components/menu/MenuItemTile";
import ConfirmPopup from "@/components/popup/ConfirmPopup";
import { API_MENU_ITEMS, KEYWORDS } from "@/constant/constant";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa6";
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules'
import { useRef } from "react";
/**
 * ComboSelector
 * Dùng cho cả 2 trường hợp:
 *  - mode="add"  : thêm combo mới vào giỏ  (mặc định)
 *  - mode="edit" : chỉnh sửa combo đã có trong giỏ
 *
 * Props:
 *  - combo            : ComboDetail object (đã populate slots, items.menuItem)
 *  - onClose()        : đóng modal
 *  - onAdded()        : callback sau khi thêm thành công (mode=add)
 *  - mode             : "add" | "edit"   (default "add")
 *  - initialSelections: object giống shape `selections` – dùng khi mode="edit"
 *  - initialQuantity  : number – dùng khi mode="edit"
 *  - initialNote      : string – dùng khi mode="edit"
 *  - cartItemId       : string – cartId của item cần update (mode="edit")
 *  - onUpdate(cartItemId, selectedItems, quantity, note) – callback khi lưu edit
 */
export default function ComboSelector({
    comboChooseList,
    setComboChooseList,
    categories = [],
    combo,
    onClose,
    mode = "add",
    chooseTabIndex,
    setChooseTabIndex,
}) {
    const [indicatorLeft, setIndicatorLeft] = useState(0);
    const [indicatorWidth, setIndicatorWidth] = useState(0);
    const tabsContainerRef = useRef(null);

    const [menuItemsBySlot, setMenuItemsBySlot] = useState({});

    const [selections, setSelections] = useState({});
    const [loadingSlots, setLoadingSlots] = useState(true);
    const [validationError, setValidationError] = useState("");
    const [editingItems, setEditingItems] = useState(new Set());
    const prevRef = useRef(null);
    const nextRef = useRef(null);
    const swiperRef = useRef(null);
    const [isBeginning, setIsBeginning] = useState(true)
    const [isEnd, setIsEnd] = useState(false)
    // ── Khởi tạo selections và load menu items ─────────────────────────────
    useEffect(() => {
        if (!combo?.slots) return;

        // Khởi tạo selections dạng Map cho mỗi slot
        // initialSelections[slotIdx] có thể là:
        //   - Map (đã chuẩn) → dùng thẳng
        //   - Array [{menuItem, selectedSize, quantity}] → convert → Map
        // Nếu comboChooseList đã có data → gán thẳng vào selections, bỏ qua initSelections
        if (comboChooseList?.length > 0) {
            const mapFromList = {};
            combo.slots.forEach((_, idx) => { mapFromList[idx] = new Map(); });
            comboChooseList.forEach(({ slotIndex, menuItem, selectedSize, quantity }) => {
                if (menuItem == null || slotIndex == null) return;
                const map = mapFromList[slotIndex] ?? new Map();
                map.set(menuItem._id, {
                    menuItem,
                    selectedSize: selectedSize ?? null,
                    quantity: quantity ?? 1,
                });
                mapFromList[slotIndex] = map;
            });
            setSelections(mapFromList);
        } else {
            const initSelections = {};
            combo.slots.forEach((_, idx) => {
                initSelections[idx] = new Map();
            });
            setSelections(initSelections);
        }

        const promises = combo.slots.map(async (slot, idx) => {
            const catId = slot.category?._id || slot.category;
            if (!catId) return { idx, items: [] };
            return fetch(`${API_MENU_ITEMS}?category=${catId}&status=on&all=true`)
                .then((r) => r.json())
                .then((d) => ({ idx, items: d.menuItems || [] }))
                .catch(() => ({ idx, items: [] }));
        });

        Promise.all(promises).then((results) => {
            const bySlot = {};
            results.forEach(({ idx, items }) => {
                const slotSize = combo.slots[idx].size;
                if (slotSize?.name) {
                    // Chỉ giữ items có size khớp (case-insensitive)
                    bySlot[idx] = items.filter((item) =>
                        item.sizes?.some(
                            (s) => s.name.trim().toLowerCase() === slotSize.name.trim().toLowerCase()
                                && String(s.price || 0) === String(slotSize.price || 0)
                        )
                    );
                } else {
                    // Category không có size → show hết
                    bySlot[idx] = items;
                }
            });
            setMenuItemsBySlot(bySlot);
            setLoadingSlots(false);
        });
    }, [combo, mode]);

    // ── Helpers ────────────────────────────────────────────────────────────

    /** Lấy entry của 1 item trong slot (hoặc undefined) */
    function getEntry(slotIdx, itemId) {
        return selections[slotIdx]?.get(itemId);
    }

    /** Tổng số lượng đã chọn trong 1 slot */
    function totalChosenInSlot(slotIdx) {
        const map = selections[slotIdx];
        if (!map) return 0;
        let total = 0;
        map.forEach((entry) => { total += entry.quantity || 1; });
        return total;
    }

    /**
     * Tăng quantity của 1 item trong slot.
     * Nếu chưa có thì thêm mới với qty = 1.
     */
    function incrementItem(slotIdx, menuItem) {
        if (totalChosenInSlot(slotIdx) >= combo.slots[slotIdx].quantity) return;

        setSelections((prev) => {
            const map = new Map(prev[slotIdx] || []);
            const key = menuItem._id;
            const slotSize = combo.slots[slotIdx].size ?? null;
            if (map.has(key)) {
                const entry = { ...map.get(key) };
                entry.quantity = (entry.quantity || 1) + 1;
                map.set(key, entry);
            } else {
                map.set(key, { menuItem, selectedSize: slotSize, quantity: 1 });
            }
            const newSelections = { ...prev, [slotIdx]: map };

            if (mode === "edit") {
                const result = [];
                combo.slots.forEach((_, idx) => {
                    const m = newSelections[idx] || new Map();
                    m.forEach((entry) => {
                        if (!entry.menuItem) return;
                        result.push({
                            menuItem: entry.menuItem,
                            selectedSize: entry.selectedSize || undefined,
                            slotIndex: idx,
                            quantity: entry.quantity || 1,
                        });
                    });
                });
                setComboChooseList(result.sort((a, b) =>
                    a.slotIndex !== b.slotIndex
                        ? a.slotIndex - b.slotIndex
                        : a.menuItem._id.localeCompare(b.menuItem._id)
                ));
            }

            return newSelections;
        });
        setValidationError("");
    }
    /**
     * Giảm quantity của 1 item trong slot.
     * Nếu qty về 0 thì xoá khỏi Map.
     */
    function decrementItem(slotIdx, menuItem) {
        setSelections((prev) => {
            const map = new Map(prev[slotIdx] || []);
            const key = menuItem._id;
            if (!map.has(key)) return prev;
            const entry = { ...map.get(key) };
            if ((entry.quantity || 1) <= 1) {
                map.delete(key);
            } else {
                entry.quantity = entry.quantity - 1;
                map.set(key, entry);
            }
            return { ...prev, [slotIdx]: map };
        });
        setValidationError("");
    }

    // ── Validate ───────────────────────────────────────────────────────────
    function validate() {
        const slots = combo.slots;
        for (let slotIdx = 0; slotIdx < slots.length; slotIdx++) {
            const slot = slots[slotIdx];
            const total = totalChosenInSlot(slotIdx);
            if (chooseTabIndex === slotIdx && total < slot.quantity) {
                const label = slot.label || slot.category?.name || `Slot ${slotIdx + 1}`;
                return `"${label}": cần chọn đủ ${slot.quantity} món (đã chọn ${total})`;
            }

            // const map = selections[slotIdx] || new Map();
            // for (const [, entry] of map) {
            //     if (entry.menuItem?.sizes?.length > 0 && !entry.selectedSize) {
            //         return `Món "${entry.menuItem.name}" cần chọn size`;
            //     }
            // }
        }
        return null;
    }

    // ── Build selectedItems payload ────────────────────────────────────────
    function buildSelectedItems() {
        const result = [];
        combo.slots.forEach((_, slotIdx) => {
            const map = selections[slotIdx] || new Map();
            map.forEach((entry) => {
                if (!entry.menuItem) return;
                result.push({
                    menuItem: entry.menuItem,
                    selectedSize: entry.selectedSize || undefined,
                    slotIndex: slotIdx,
                    quantity: entry.quantity || 1,
                });
            });
        });
        return result.sort((a, b) => {
            if (a.slotIndex !== b.slotIndex) return a.slotIndex - b.slotIndex;
            return a.menuItem._id.localeCompare(b.menuItem._id);
        });
    }

    const handleChooseCombo = () => {
        // Check tất cả slots từ 0 đến chooseTabIndex
        for (let i = 0; i <= chooseTabIndex; i++) {
            const slot = combo.slots[i];
            const total = totalChosenInSlot(i);
            if (total < slot.quantity) {
                const category= categories.find(c => c._id === slot.category)
                const label = slot.label || category.name || `Slot ${i + 1}`;
                setValidationError(`"${label}": cần chọn đủ ${slot.quantity} món (đã chọn ${total})`);
                setChooseTabIndex(i); // Nhảy về slot lỗi
                return;
            }
        }

        if (chooseTabIndex < combo.slots.length - 1) {
            setChooseTabIndex(chooseTabIndex + 1);
            setEditingItems(new Set());
            return;
        }

        // Slot cuối → check toàn bộ tất cả slots
        const err = validate();
        if (err) {
            if (mode === "edit") {
                onClose();
                return;
            }
            setValidationError(err);
            return;
        }

        setComboChooseList(buildSelectedItems());
        onClose();
    }
    // useEffect(() => {
    //     if (swiperRef.current) {
    //         swiperRef.current.slideTo(chooseTabIndex);
    //     }
    // }, [chooseTabIndex]);

    const updateIndicator = () => {
        if (!swiperRef.current) return;
        const swiper = swiperRef.current;
        const activeSlide = swiper.slides?.[chooseTabIndex];
        if (!activeSlide || !swiper.el) return;
        const containerRect = swiper.el.getBoundingClientRect();
        const slideRect = activeSlide.getBoundingClientRect();
        setIndicatorLeft(slideRect.left - containerRect.left);
        setIndicatorWidth(slideRect.width);
    };

    useEffect(() => {
        updateIndicator();
    }, [chooseTabIndex, menuItemsBySlot]);
    useEffect(() => {
        if (swiperRef.current) {
            swiperRef.current.slideTo(chooseTabIndex, 300);
            // Đợi animation xong mới tính indicator
            setTimeout(updateIndicator, 350);
        }
    }, [chooseTabIndex]);

    if (!combo) return null;
    const slots = combo?.slots || [];
    const isEdit = mode === "edit";
    const totalRequired = combo?.slots?.reduce((sum, s) => sum + (s.quantity || 1), 0) ?? 0;
    const totalChosen = comboChooseList.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const isComboComplete = totalChosen >= totalRequired;
    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center md:p-4">
            {/* Backdrop */}
            {isComboComplete ? <div className="absolute inset-0 bg-black/50" onClick={onClose} /> : <ConfirmPopup onDelete={onClose} label="Thoát tạo mới combo" labelDesc="Lựa chọn của bạn sẽ bị mất nếu bạn thoát khỏi combo. Bạn có chắc chắn muốn thoát" labelConfirm="Thoát">
                <div className="absolute inset-0 bg-black/80" />
            </ConfirmPopup>}
            <div className="relative w-full lg:w-[960px] p-4 bg-white rounded-md shadow-2xl h-[100vh] flex flex-col">
                {/* Header */}
                <div className="relative mb-4">
                    <h4 className="text-2xl font-semibold"> {isEdit ? "Chỉnh sửa combo" : "Tạo mới combo"}</h4>
                    {comboChooseList.length > 0 ? <button
                        className="absolute top-0 text-2xl transition right-3" onClick={onClose}
                    >✕</button> : <ConfirmPopup onDelete={onClose} label="Thoát tạo mới combo" labelDesc="Lựa chọn của bạn sẽ bị mất nếu bạn thoát khỏi combo. Bạn có chắc chắn muốn thoát" labelConfirm="Thoát">
                        <button
                            className="absolute top-0 text-2xl transition right-3"
                        >✕</button>
                    </ConfirmPopup>}
                </div>

                {/* Step choose menu items */}
                <div className="flex-1 overflow-y-auto ">
                    {loadingSlots ? (
                        <div className="flex items-center justify-center py-12 ">
                            <div className="border-orange-400 rounded-full w-7 h-7 border-3 border-t-transparent animate-spin" />
                            <span className="ml-3 text-sm text-gray-400">Đang tải món...</span>
                        </div>) : (
                        <>

                            <div className="relative w-full min-w-0 ">
                                <Swiper
                                    slidesPerView={1.4}
                                    spaceBetween={10}
                                    slidesPerGroup={2}
                                    breakpoints={{
                                        480: {
                                            slidesPerView: 2.4,
                                        },
                                        640: {
                                            slidesPerView: 3.4,
                                        },
                                    }}
                                    onSwiper={(swiper) => {
                                        swiperRef.current = swiper;
                                        swiper.slideTo(chooseTabIndex);
                                        setIsBeginning(swiper.isBeginning)
                                        setIsEnd(swiper.isEnd)
                                    }}
                                    onSlideChange={(swiper) => {
                                        setIsBeginning(swiper.isBeginning)
                                        setIsEnd(swiper.isEnd)
                                        updateIndicator();
                                    }}
                                    onTransitionEnd={() => updateIndicator()}
                                    modules={[Navigation]}
                                >
                                    {slots.map((slot, slotIdx) => {
                                        const slotItems = menuItemsBySlot[slotIdx] || [];
                                        const category = categories.find(c => c._id === slot.category)
                                        const total = totalChosenInSlot(slotIdx);
                                        return (
                                            <SwiperSlide key={slotIdx}>
                                                <div key={slotIdx} className={`flex items-center gap-2  ${total === 0 && chooseTabIndex !== slotIdx ? "opacity-50 pointer-events-none" : "cursor-pointer"}`} onClick={() => { setChooseTabIndex(slotIdx); setEditingItems(new Set()); }}>
                                                    <div className={`flex flex-shrink-0 items-center justify-center w-8 h-8 text-sm rounded-full border ${chooseTabIndex === slotIdx ? "bg-primary text-white " : "border-primary text-primary"}`}> <p className="font-semibold">{total > 0 && chooseTabIndex !== slotIdx ? <FaCheck /> : slotIdx + 1}</p></div>
                                                    <div>
                                                        <p className="text-sm font-semibold whitespace-nowrap md:text-base">Chọn  {category?.name} {slot.quantity > 0 && `(${total}/${slot.quantity})`}</p>
                                                        <p className="text-sm font-semibold text-secondary">Yêu cầu</p>
                                                    </div>
                                                </div>
                                            </SwiperSlide>
                                        )
                                    })}
                                </Swiper>
                                <div className="md:hidden relative bottom-0 w-full h-0.5 bg-gray-100 mt-2 rounded-full">
                                    <div
                                        className="absolute bottom-0 h-full transition-all duration-300 ease-out rounded-full bg-primary"
                                        style={{
                                            left: indicatorLeft,
                                            width: indicatorWidth,
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2 mt-4 md:grid-cols-2 ">
                                {menuItemsBySlot[chooseTabIndex]?.map((mi, index) => {
                                    const entry = getEntry(chooseTabIndex, mi._id);
                                    const qty = entry?.quantity || 0;
                                    const isChosen = qty > 0;
                                    return (
                                        <div
                                            key={mi._id}
                                            className={`flex h-[156px] border md:rounded-2xl cursor-pointer overflow-hidden group transition duration-300  rounded-2xl  `}
                                        >
                                            {/* Ảnh */}
                                            <div className={`w-[111px] md:w-[161px] h-full shrink-0 overflow-hidden relative`}>
                                                <Image
                                                    src={mi.image}
                                                    alt={mi.name}
                                                    fill
                                                    className={`transition-transform duration-500  ${KEYWORDS.some(keyword =>
                                                        mi.name?.toLowerCase().includes(keyword)
                                                    ) ? "object-contain scale-[1.4] " : "object-cover scale-100"} `}
                                                    style={
                                                        KEYWORDS.some(keyword =>
                                                            mi.name?.toLowerCase().includes(keyword)
                                                        ) ? { objectPosition: "left center", top: "10%", left: "-20%" } : {}
                                                    }
                                                />
                                            </div>
                                            <div className='flex flex-col justify-between flex-1 w-full p-4 pl-2'>
                                                <div>
                                                    <h4 title={mi.name} className={`md:text-lg text-sm md:leading-[26px] capitalize  line-clamp-2 font-bold `}>{mi.name}</h4>
                                                    <p className='text-sm text-secondary line-clamp-1'>{mi.description}</p>
                                                    {combo.slots[chooseTabIndex].size?.name && (
                                                        <span className="text-xs font-medium ">
                                                            Kích thước: {combo.slots[chooseTabIndex].size.name}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className='relative flex items-center justify-between w-full'>
                                                    <div>
                                                        <p className={`font-medium  md:text-base mt-1 text-sm `}>{(mi.basePrice + (mi.sizes?.[0]?.price || 0)).toLocaleString('vi-VN')}<span className='ml-2 underline'>đ</span></p>
                                                    </div>
                                                    {(() => {
                                                        const slotFull = totalChosenInSlot(chooseTabIndex) >= combo.slots[chooseTabIndex].quantity;
                                                        const isEditing = editingItems.has(mi._id);

                                                        if (isChosen && (!slotFull || isEditing)) {
                                                            // Đang chọn chưa đủ slot, HOẶC đã bấm edit → hiện +/-
                                                            return (
                                                                <div className="absolute right-0 flex items-center gap-4">
                                                                    <ButtonDecrement onClick={() => decrementItem(chooseTabIndex, mi)} />
                                                                    <span className="text-sm font-medium md:text-lg">{qty}</span>
                                                                    <ButtonIncrement onClick={() => incrementItem(chooseTabIndex, mi)} />
                                                                </div>
                                                            );
                                                        }

                                                        if (isChosen && slotFull) {
                                                            // Đã chọn & slot đủ → hiện nút check, bấm để mở edit
                                                            return (
                                                                <ButtonAdd
                                                                    className="absolute right-0 add-to-cart-zone"
                                                                    onClick={() => {
                                                                        setEditingItems(prev => {
                                                                            const next = new Set(prev);
                                                                            next.add(mi._id);
                                                                            return next;
                                                                        });
                                                                    }}
                                                                    forCombo={combo.slots[chooseTabIndex].quantity > 1 ? qty : "check"}
                                                                />
                                                            );
                                                        }

                                                        // Chưa chọn → nút add bình thường
                                                        return (
                                                            <ButtonAdd
                                                                className="absolute right-0 add-to-cart-zone"
                                                                onClick={() => incrementItem(chooseTabIndex, mi)}
                                                                forCombo="add"
                                                            />
                                                        );
                                                    })()}
                                                </div>
                                            </div>

                                        </div>
                                    )
                                })}
                            </div>
                        </>
                    )
                    }
                </div>
                {validationError && (
                    <div className="px-3 py-2 my-4 text-xs text-red-600 border border-red-200 rounded-lg bg-red-50">
                        {validationError}
                    </div>
                )}

                <ButtonPrimary disabled={totalChosenInSlot(chooseTabIndex) === 0} className={"w-full hover:scale-[1.0]"} onClick={handleChooseCombo}>Tiếp tục{" "}<span className="inline-block w-2 h-2 mx-2 bg-white rounded-full" />{" "}
                    {combo?.price?.toLocaleString('vi-VN')} <span className="underline">đ</span></ButtonPrimary>
            </div>
        </div>
    );
}