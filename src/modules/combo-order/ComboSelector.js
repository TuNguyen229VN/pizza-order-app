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
    onAdded,
    mode = "add",
    initialSelections = {},
    initialQuantity = 1,
    initialNote = "",
    cartItemId,
    onUpdate,
}) {
    const { addComboToCart } = useContext(CartContext);

    const [menuItemsBySlot, setMenuItemsBySlot] = useState({});

    // 

    const [chooseTabIndex, setChooseTabIndex] = useState(0);

    /**
     * selections[slotIdx] = Map<itemId, { menuItem, selectedSize, quantity }>
     * Dùng Map để dễ tăng/giảm quantity theo itemId
     */

    const [selections, setSelections] = useState({});
    const [quantity, setQuantity] = useState(initialQuantity);
    const [noteOrder, setNoteOrder] = useState(initialNote);
    const [loadingSlots, setLoadingSlots] = useState(true);
    const [adding, setAdding] = useState(false);
    const [validationError, setValidationError] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);

    const [editingItems, setEditingItems] = useState(new Set());
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
            // Logic cũ
            const initSelections = {};
            combo.slots.forEach((slot, idx) => {
                if (mode === "edit" && initialSelections[idx] != null) {
                    const raw = initialSelections[idx];
                    if (raw instanceof Map) {
                        initSelections[idx] = new Map(raw);
                    } else if (Array.isArray(raw)) {
                        const map = new Map();
                        raw.forEach((entry) => {
                            if (!entry?.menuItem) return;
                            const key = entry.menuItem._id;
                            if (map.has(key)) {
                                map.get(key).quantity += (entry.quantity || 1);
                            } else {
                                map.set(key, { ...entry, quantity: entry.quantity || 1 });
                            }
                        });
                        initSelections[idx] = map;
                    } else {
                        initSelections[idx] = new Map();
                    }
                } else {
                    initSelections[idx] = new Map();
                }
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
            results.forEach(({ idx, items }) => { bySlot[idx] = items; });
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
        if (totalChosenInSlot(slotIdx) >= combo.slots[slotIdx].quantity) {
            return;
        }
        setSelections((prev) => {
            const map = new Map(prev[slotIdx] || []);
            const key = menuItem._id;
            if (map.has(key)) {
                const entry = { ...map.get(key) };
                entry.quantity = (entry.quantity || 1) + 1;
                map.set(key, entry);
            } else {
                map.set(key, { menuItem, selectedSize: null, quantity: 1 });
            }
            return { ...prev, [slotIdx]: map };
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

    function selectSize(slotIdx, itemId, size) {
        setSelections((prev) => {
            const map = new Map(prev[slotIdx] || []);
            if (!map.has(itemId)) return prev;
            const entry = { ...map.get(itemId), selectedSize: size };
            map.set(itemId, entry);
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

            const map = selections[slotIdx] || new Map();
            for (const [, entry] of map) {
                if (entry.menuItem?.sizes?.length > 0 && !entry.selectedSize) {
                    return `Món "${entry.menuItem.name}" cần chọn size`;
                }
            }
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
        return result;
    }

    // ── Add / Update ───────────────────────────────────────────────────────
    function handleSubmit() {
        const err = validate();
        if (err) { setValidationError(err); return; }

        setAdding(true);
        const selectedItems = buildSelectedItems();

        if (mode === "edit" && cartItemId && onUpdate) {
            onUpdate(cartItemId, selectedItems, quantity, noteOrder);
        } else {
            // addComboToCart nên merge quantity nếu combo+items giống nhau
            addComboToCart(combo, selectedItems, quantity, noteOrder);
        }

        setShowSuccess(true);
        setTimeout(() => {
            setAdding(false);
            setShowSuccess(false);
            onAdded?.();
            onClose?.();
        }, 900);
    }

    const handleChooseCombo = () => {
        const err = validate();
        if (err) { setValidationError(err); return; }
        if (chooseTabIndex < combo.slots.length - 1) {
            setChooseTabIndex(chooseTabIndex + 1);
            setEditingItems(new Set());
            return;
        }
        onClose();
        setComboChooseList(buildSelectedItems());
    }

    if (!combo) return null;
    const slots = combo?.slots || [];
    const isEdit = mode === "edit";

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center md:p-4">
            {/* Backdrop */}
            {comboChooseList.length > 0 ? <div className="absolute inset-0 bg-black/50" onClick={onClose} /> : <ConfirmPopup onDelete={onClose} label="Thoát tạo mới combo" labelDesc="Lựa chọn của bạn sẽ bị mất nếu bạn thoát khỏi combo. Bạn có chắc chắn muốn thoát" labelConfirm="Thoát">
                <div className="absolute inset-0 bg-black/80" />
            </ConfirmPopup>}
            <div className="relative w-[960px] p-4 bg-white rounded-md shadow-2xl h-[100vh] flex flex-col">
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

                            <div className="flex items-center gap-10">
                                {slots.map((slot, slotIdx) => {
                                    const slotItems = menuItemsBySlot[slotIdx] || [];
                                    const category = categories.find(c => c._id === slot.category)
                                    const total = totalChosenInSlot(slotIdx);
                                    return (
                                        <div key={slotIdx} className={`flex items-center gap-2  ${total === 0 && chooseTabIndex !== slotIdx ? "opacity-50 pointer-events-none" : "cursor-pointer"}`} onClick={() => { setChooseTabIndex(slotIdx); setEditingItems(new Set()); }}>
                                            <div className={`flex items-center justify-center w-8 h-8 text-sm rounded-full border ${chooseTabIndex === slotIdx ? "bg-primary text-white " : "border-primary text-primary"}`}> <p className="font-semibold">{total > 0 && chooseTabIndex !== slotIdx ? <FaCheck /> : slotIdx + 1}</p></div>
                                            <div>
                                                <p className="font-semibold">Chọn  {category?.name}  {slot.quantity > 0 && `${total}/${slot.quantity}`}</p>
                                                <p className="text-sm font-semibold text-secondary">Yêu cầu</p>
                                            </div>

                                        </div>
                                    )
                                })}
                            </div>
                            <div className="grid gap-2 mt-4 md:grid-cols-2 ">
                                {menuItemsBySlot[chooseTabIndex].map((mi) => {
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
                                                    <h4 className={`md:text-lg text-sm md:leading-[26px] capitalize  line-clamp-2 font-bold`}>{mi.name}</h4>
                                                    <p className='text-sm text-secondary line-clamp-1'>{mi.description}</p>
                                                </div>
                                                <div className='flex items-center justify-between w-full'>
                                                    <div>
                                                        <p className={`font-medium  md:text-base mt-1 text-sm `}>{(mi.basePrice + (mi.sizes?.[0]?.price || 0)).toLocaleString('vi-VN')}<span className='ml-2 underline'>đ</span></p>
                                                    </div>

                                                    {(() => {
                                                        const slotFull = totalChosenInSlot(chooseTabIndex) >= combo.slots[chooseTabIndex].quantity;
                                                        const isEditing = editingItems.has(mi._id);

                                                        if (isChosen && (!slotFull || isEditing)) {
                                                            // Đang chọn chưa đủ slot, HOẶC đã bấm edit → hiện +/-
                                                            return (
                                                                <>
                                                                    <ButtonDecrement onClick={() => decrementItem(chooseTabIndex, mi)} />
                                                                    <span className="text-sm font-medium md:text-lg">{qty}</span>
                                                                    <ButtonIncrement onClick={() => incrementItem(chooseTabIndex, mi)} />
                                                                </>
                                                            );
                                                        }

                                                        if (isChosen && slotFull) {
                                                            // Đã chọn & slot đủ → hiện nút check, bấm để mở edit
                                                            return (
                                                                <ButtonAdd
                                                                    className="add-to-cart-zone"
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
                                                                className="add-to-cart-zone"
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
                            {/* Size picker cho từng entry đã chọn mà có sizes */}
                            {Array.from((selections[chooseTabIndex] || new Map()).values())
                                .filter((sel) => sel.menuItem?.sizes?.length > 0)
                                .map((sel, i) => (
                                    <div key={i} className="my-3 ml-1">
                                        <p className="text-xs text-orange-600 font-medium mb-1.5">
                                            ⚠️ Chọn size cho <strong>{sel.menuItem.name}</strong>
                                            {sel.quantity > 1 && <span className="text-gray-400"> (x{sel.quantity})</span>}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {sel.menuItem.sizes.map((sz) => {
                                                const isActive = sel.selectedSize?.name === sz.name;
                                                return (
                                                    <button
                                                        key={sz.name}
                                                        type="button"
                                                        onClick={() => selectSize(chooseTabIndex, sel.menuItem._id, { name: sz.name, price: sz.price })}
                                                        className={`px-3 py-1.5 rounded - lg text - xs border font - medium transition - all ${isActive
                                                            ? "bg-orange-500 text-white border-orange-500"
                                                            : "bg-white text-gray-600 border-gray-300 hover:border-orange-400"
                                                            } `}
                                                    >
                                                        {sz.name}
                                                        {sz.price > 0 && <span className="ml-1 underline opacity-80">+{sz.price?.toLocaleString("vi-VN")}₫</span>}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                        </>
                    )
                    }
                </div>
                {validationError && (
                    <div className="px-3 py-2 mt-4 text-xs text-red-600 border border-red-200 rounded-lg bg-red-50">
                        {validationError}
                    </div>
                )}

                <ButtonPrimary disabled={totalChosenInSlot(chooseTabIndex) === 0} className={"w-full hover:scale-[1.0]"} onClick={handleChooseCombo}><p>Tiếp tục</p></ButtonPrimary>
            </div>
        </div>
    );
}