"use client";
import { CartContext } from "@/components/AppContext";
import MenuItemTile from "@/components/menu/MenuItemTile";
import { API_MENU_ITEMS } from "@/constant/constant";
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

    const [chooseTabIndex, setChooseTabIndex] = useState(1);

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

    // ── Khởi tạo selections và load menu items ─────────────────────────────
    useEffect(() => {
        if (!combo?.slots) return;

        // Khởi tạo selections dạng Map cho mỗi slot
        // initialSelections[slotIdx] có thể là:
        //   - Map (đã chuẩn) → dùng thẳng
        //   - Array [{menuItem, selectedSize, quantity}] → convert → Map
        const initSelections = {};
        combo.slots.forEach((slot, idx) => {
            if (mode === "edit" && initialSelections[idx] != null) {
                const raw = initialSelections[idx];
                if (raw instanceof Map) {
                    // Đã đúng format
                    initSelections[idx] = new Map(raw);
                } else if (Array.isArray(raw)) {
                    // Convert mảng → Map, gộp trùng _id
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

            if (total < slot.quantity) {
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

    if (!combo) return null;
    const slots = combo?.slots || [];
    const isEdit = mode === "edit";

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80" onClick={onClose} />

            <div className="relative w-[960px] p-4 bg-white rounded-md shadow-2xl h-[100vh] overflow-y-auto">
                {/* Header */}
                <div className="relative mb-4">
                    <h4 className="text-2xl font-medium"> {isEdit ? "Chỉnh sửa combo" : "Tạo mới combo"}</h4>
                    <button
                        onClick={onClose}
                        className="absolute top-0 text-2xl transition right-3"
                    >✕</button>
                </div>

                {/* Step choose menu items */}
                <div>
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
                                        <div key={slotIdx} className="flex items-center gap-2 cursor-pointer" onClick={() => setChooseTabIndex(slotIdx)}>
                                            <div className={`flex items-center justify-center w-8 h-8 text-sm rounded-full border ${chooseTabIndex===slotIdx?"bg-primary text-white ":"border-primary text-primary"}`}> <p className="font-semibold">{total>0&&chooseTabIndex!==slotIdx?<FaCheck />:slotIdx+1}</p></div>
                                            <div>
                                                <p className="font-semibold">Chọn  {category?.name}  {slot.quantity > 0 && `${total}/${slot.quantity}`}</p>
                                                <p className="text-sm font-semibold text-secondary">Yêu cầu</p>
                                            </div>

                                        </div>
                                    )
                                })}
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-4 ">
                                {menuItemsBySlot[chooseTabIndex].map((mi) => {
                                    const entry = getEntry(chooseTabIndex, mi._id);
                                    const qty = entry?.quantity || 0;
                                    const isChosen = qty > 0;

                                 return(
                                    <MenuItemTile key={mi._id} {...mi} recomStyle={"recomStyle"}/>
                                 )
                                })}
                            </div>
                        </>
                    )
                    }

                </div>

                <div className="flex-1 px-4 py-4 space-y-5 overflow-y-auto">
                    {loadingSlots ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="border-orange-400 rounded-full w-7 h-7 border-3 border-t-transparent animate-spin" />
                            <span className="ml-3 text-sm text-gray-400">Đang tải món...</span>
                        </div>
                    ) : (
                        slots.map((slot, slotIdx) => {
                            const slotItems = menuItemsBySlot[slotIdx] || [];
                            const slotLabel = slot.label || slot.category?.name || `Slot ${slotIdx + 1}`;
                            const total = totalChosenInSlot(slotIdx);

                            return (
                                <div key={slotIdx}>

                                    {/* Grid chọn món */}
                                    <div className="grid grid-cols-2 gap-2">
                                        {slotItems.map((mi) => {
                                            const entry = getEntry(slotIdx, mi._id);
                                            const qty = entry?.quantity || 0;
                                            const isChosen = qty > 0;

                                            return (
                                                <div
                                                    key={mi._id}
                                                    className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${isChosen
                                                        ? "border-orange-500 bg-orange-50 ring-1 ring-orange-400"
                                                        : "border-gray-200 bg-white"
                                                        }`}
                                                >
                                                    {/* Ảnh */}
                                                    {mi.image ? (
                                                        <img src={mi.image} alt={mi.name} className="flex-shrink-0 object-cover w-10 h-10 rounded-lg" />
                                                    ) : (
                                                        <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 text-lg bg-gray-100 rounded-lg">🍽️</div>
                                                    )}

                                                    {/* Tên + giá */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-medium leading-tight text-gray-800 line-clamp-2">{mi.name}</p>
                                                        {mi.sizes?.length > 0 ? (
                                                            <p className="text-[10px] text-orange-500 mt-0.5">Chọn size ↓</p>
                                                        ) : (
                                                            <p className="text-[10px] text-gray-400 mt-0.5">{mi.basePrice?.toLocaleString("vi-VN")}₫</p>
                                                        )}
                                                    </div>

                                                    {/* Nút +/− quantity */}
                                                    <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                                                        {/* Nút + luôn hiển thị */}
                                                        <button
                                                            type="button"
                                                            onClick={() => incrementItem(slotIdx, mi)}
                                                            className="flex items-center justify-center w-6 h-6 text-base font-bold leading-none text-white transition-colors bg-orange-500 rounded-full hover:bg-orange-600"
                                                        >
                                                            +
                                                        </button>

                                                        {/* Số lượng + nút − chỉ hiện khi đã chọn */}
                                                        {isChosen && (
                                                            <>
                                                                <span className="text-xs font-bold leading-none text-orange-600">{qty}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => decrementItem(slotIdx, mi)}
                                                                    className="flex items-center justify-center w-6 h-6 text-base font-bold leading-none text-gray-600 transition-colors bg-gray-200 rounded-full hover:bg-gray-300"
                                                                >
                                                                    −
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Size picker cho từng entry đã chọn mà có sizes */}
                                    {Array.from((selections[slotIdx] || new Map()).values())
                                        .filter((sel) => sel.menuItem?.sizes?.length > 0)
                                        .map((sel, i) => (
                                            <div key={i} className="mt-3 ml-1">
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
                                                                onClick={() => selectSize(slotIdx, sel.menuItem._id, { name: sz.name, price: sz.price })}
                                                                className={`px-3 py-1.5 rounded-lg text-xs border font-medium transition-all ${isActive
                                                                    ? "bg-orange-500 text-white border-orange-500"
                                                                    : "bg-white text-gray-600 border-gray-300 hover:border-orange-400"
                                                                    }`}
                                                            >
                                                                {sz.name}
                                                                {sz.price > 0 && <span className="ml-1 opacity-80">+{sz.price?.toLocaleString("vi-VN")}₫</span>}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            );
                        })
                    )}

                </div>
            </div>

        </div>
    );
}