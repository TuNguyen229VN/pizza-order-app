"use client";
import { CartContext } from "@/components/AppContext";
import { useContext, useEffect, useState } from "react";
// import { CartContext } from "@/app/AppProvider";

/**
 * ComboSelector
 * Trang / Modal cho khách chọn combo rồi thêm vào giỏ.
 *
 * Props:
 *  - combo: ComboDetail object (đã populate comboType.slots, items.menuItem)
 *  - onClose(): callback đóng modal
 *  - onAdded(): callback sau khi thêm vào giỏ thành công
 */
export default function ComboSelector({ combo, onClose, onAdded }) {
    const { addComboToCart } = useContext(CartContext);

    // menuItemsBySlot[slotIdx] = MenuItem[] lấy từ API theo category
    const [menuItemsBySlot, setMenuItemsBySlot] = useState({});
    // selections[slotIdx] = [{ menuItem: obj, selectedSize: {name,price}|null }]
    const [selections, setSelections] = useState({});
    const [quantity, setQuantity] = useState(1);
    const [noteOrder, setNoteOrder] = useState("");
    const [loadingSlots, setLoadingSlots] = useState(true);
    const [adding, setAdding] = useState(false);
    const [validationError, setValidationError] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);

    // ── Khởi tạo selections và load menu items ─────────────────────────────
    useEffect(() => {
        if (!combo?.comboType?.slots) return;

        const initSelections = {};
        combo.comboType.slots.forEach((slot, idx) => {
            initSelections[idx] = Array.from({ length: slot.quantity }, () => ({
                menuItem: null,
                selectedSize: null,
            }));
        });
        setSelections(initSelections);

        // Load menu items theo category cho từng slot
        const promises = combo.comboType.slots.map((slot, idx) => {
            const catId = slot.category?._id || slot.category; // ✅ handle cả string lẫn object
            if (!catId) return Promise.resolve({ idx, items: [] });
            return fetch(`/api/menu-items?category=${catId}&status=on&all=true`)
                .then((r) => r.json())
                .then((d) => ({ idx, items: d.menuItems || [] }))
                .catch(() => ({ idx, items: [] })); // ✅ tránh crash nếu 1 slot lỗi
        });

        Promise.all(promises).then((results) => {
            const bySlot = {};
            results.forEach(({ idx, items }) => {
                bySlot[idx] = items;
            });
            setMenuItemsBySlot(bySlot);
            setLoadingSlots(false);
        });
    }, [combo]);

    // ── Helpers ────────────────────────────────────────────────────────────
    function selectMenuItem(slotIdx, itemIdx, menuItem) {
        setSelections((prev) => {
            const slotArr = [...(prev[slotIdx] || [])];
            slotArr[itemIdx] = { menuItem, selectedSize: null };
            return { ...prev, [slotIdx]: slotArr };
        });
        setValidationError("");
    }

    function selectSize(slotIdx, itemIdx, size) {
        setSelections((prev) => {
            const slotArr = [...(prev[slotIdx] || [])];
            slotArr[itemIdx] = { ...slotArr[itemIdx], selectedSize: size };
            return { ...prev, [slotIdx]: slotArr };
        });
        setValidationError("");
    }

    // ── Validate ───────────────────────────────────────────────────────────
    function validate() {
        const slots = combo.comboType.slots;
        for (let slotIdx = 0; slotIdx < slots.length; slotIdx++) {
            const slot = slots[slotIdx];
            const slotSels = selections[slotIdx] || [];
            for (let itemIdx = 0; itemIdx < slot.quantity; itemIdx++) {
                const sel = slotSels[itemIdx];
                if (!sel?.menuItem) {
                    return `Slot "${slot.label || slot.category?.name || slot.category}": chưa chọn đủ món...`;
                }
                if (sel.menuItem.sizes?.length > 0 && !sel.selectedSize) {
                    return `Món "${sel.menuItem.name}" cần chọn size`;
                }
            }
        }
        return null;
    }

    // ── Add to cart ────────────────────────────────────────────────────────
    function handleAddToCart() {
        const err = validate();
        if (err) { setValidationError(err); return; }

        setAdding(true);
        const selectedItems = [];
        combo.comboType.slots.forEach((_, slotIdx) => {
            (selections[slotIdx] || []).forEach((sel) => {
                selectedItems.push({
                    menuItem: sel.menuItem,
                    selectedSize: sel.selectedSize || undefined,
                    slotIndex: slotIdx,
                    quantity: 1,
                });
            });
        });

        addComboToCart(combo, selectedItems, quantity, noteOrder);

        setShowSuccess(true);
        setTimeout(() => {
            setAdding(false);
            setShowSuccess(false);
            onAdded?.();
            onClose?.();
        }, 900);
    }

    if (!combo) return null;

    const slots = combo.comboType?.slots || [];

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Sheet */}
            <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="relative flex-shrink-0">
                    {combo.image ? (
                        <img
                            src={combo.image}
                            alt={combo.name}
                            className="object-cover w-full h-44"
                        />
                    ) : (
                        <div className="w-full h-28 bg-gradient-to-br from-orange-400 to-red-500" />
                    )}
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    {/* Close btn */}
                    <button
                        onClick={onClose}
                        className="absolute flex items-center justify-center w-8 h-8 text-sm text-white transition rounded-full top-3 right-3 bg-black/40 hover:bg-black/60"
                    >
                        ✕
                    </button>
                    {/* Title */}
                    <div className="absolute bottom-3 left-4 right-4">
                        <span className="text-xs font-semibold bg-orange-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wide">
                            COMBO
                        </span>
                        <h2 className="mt-1 text-xl font-bold leading-tight text-white">{combo.name}</h2>
                    </div>
                </div>

                {/* Price bar */}
                <div className="flex items-center justify-between flex-shrink-0 px-4 py-2 border-b border-orange-100 bg-orange-50">
                    <span className="text-sm text-gray-500">Giá combo</span>
                    <span className="text-lg font-bold text-orange-600">
                        {(combo.price * quantity).toLocaleString("vi-VN")}₫
                    </span>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 px-4 py-4 space-y-5 overflow-y-auto">
                    {loadingSlots ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="border-orange-400 rounded-full w-7 h-7 border-3 border-t-transparent animate-spin" />
                            <span className="ml-3 text-sm text-gray-400">Đang tải món...</span>
                        </div>
                    ) : (
                        slots.map((slot, slotIdx) => {
                            const slotItems = menuItemsBySlot[slotIdx] || [];
                            const slotLabel = slot.label || slot.category?.name || slot.category || `Slot ${slotIdx + 1}`;

                            return (
                                <div key={slotIdx}>
                                    {/* Slot header */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 text-xs font-bold text-white bg-orange-500 rounded-full">
                                            {slotIdx + 1}
                                        </div>
                                        <h3 className="text-sm font-semibold text-gray-800">
                                            {slot.label || slot.category?.name || `Slot ${slotIdx + 1}`}
                                            <span className="ml-1 font-normal text-gray-400">
                                                — chọn {slot.quantity} món
                                            </span>
                                        </h3>
                                    </div>

                                    {/* Per-item picker */}
                                    {Array.from({ length: slot.quantity }).map((_, itemIdx) => {
                                        const sel = selections[slotIdx]?.[itemIdx];
                                        const chosen = sel?.menuItem;

                                        return (
                                            <div key={itemIdx} className="mb-3">
                                                {slot.quantity > 1 && (
                                                    <p className="mb-1 ml-1 text-xs text-gray-400">Món {itemIdx + 1}</p>
                                                )}

                                                {/* Grid chọn món */}
                                                <div className="grid grid-cols-2 gap-2">
                                                    {slotItems.map((mi) => {
                                                        const isChosen = chosen?._id === mi._id;
                                                        return (
                                                            <button
                                                                key={mi._id}
                                                                type="button"
                                                                onClick={() => selectMenuItem(slotIdx, itemIdx, mi)}
                                                                className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${isChosen
                                                                        ? "border-orange-500 bg-orange-50 ring-1 ring-orange-400"
                                                                        : "border-gray-200 bg-white hover:border-orange-300"
                                                                    }`}
                                                            >
                                                                {mi.image ? (
                                                                    <img
                                                                        src={mi.image}
                                                                        alt={mi.name}
                                                                        className="flex-shrink-0 object-cover w-10 h-10 rounded-lg"
                                                                    />
                                                                ) : (
                                                                    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 text-lg bg-gray-100 rounded-lg">
                                                                        🍽️
                                                                    </div>
                                                                )}
                                                                <div className="min-w-0">
                                                                    <p className="text-xs font-medium leading-tight text-gray-800 line-clamp-2">
                                                                        {mi.name}
                                                                    </p>
                                                                    {mi.sizes?.length > 0 ? (
                                                                        <p className="text-[10px] text-orange-500 mt-0.5">Chọn size ↓</p>
                                                                    ) : (
                                                                        <p className="text-[10px] text-gray-400 mt-0.5">
                                                                            {mi.basePrice?.toLocaleString("vi-VN")}₫
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                {isChosen && (
                                                                    <div className="ml-auto flex-shrink-0 w-4 h-4 rounded-full bg-orange-500 text-white text-[10px] flex items-center justify-center">
                                                                        ✓
                                                                    </div>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>

                                                {/* Size picker */}
                                                {chosen?.sizes?.length > 0 && (
                                                    <div className="mt-2 ml-1">
                                                        <p className="text-xs text-orange-600 font-medium mb-1.5">
                                                            ⚠️ Chọn size cho "{chosen.name}"
                                                        </p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {chosen.sizes.map((sz) => {
                                                                const isActive = sel?.selectedSize?.name === sz.name;
                                                                return (
                                                                    <button
                                                                        key={sz.name}
                                                                        type="button"
                                                                        onClick={() => selectSize(slotIdx, itemIdx, { name: sz.name, price: sz.price })}
                                                                        className={`px-3 py-1.5 rounded-lg text-xs border font-medium transition-all ${isActive
                                                                                ? "bg-orange-500 text-white border-orange-500"
                                                                                : "bg-white text-gray-600 border-gray-300 hover:border-orange-400"
                                                                            }`}
                                                                    >
                                                                        {sz.name}
                                                                        {sz.price > 0 && (
                                                                            <span className="ml-1 opacity-80">
                                                                                +{sz.price?.toLocaleString("vi-VN")}₫
                                                                            </span>
                                                                        )}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })
                    )}

                    {/* Ghi chú */}
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Ghi chú</label>
                        <textarea
                            rows={2}
                            className="w-full px-3 py-2 text-sm border border-gray-200 resize-none rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                            placeholder="VD: không hành, ít cay..."
                            value={noteOrder}
                            onChange={(e) => setNoteOrder(e.target.value)}
                        />
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="flex-shrink-0 px-4 pt-3 pb-6 space-y-3 bg-white border-t border-gray-100">
                    {/* Validation error */}
                    {validationError && (
                        <div className="px-3 py-2 text-xs text-red-600 border border-red-200 rounded-lg bg-red-50">
                            {validationError}
                        </div>
                    )}

                    {/* Quantity + Add */}
                    <div className="flex items-center gap-3">
                        {/* Quantity picker */}
                        <div className="flex items-center overflow-hidden border border-gray-200 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                className="flex items-center justify-center w-10 h-10 text-xl text-gray-600 transition hover:bg-gray-50"
                            >
                                −
                            </button>
                            <span className="w-8 font-bold text-center text-gray-800">{quantity}</span>
                            <button
                                type="button"
                                onClick={() => setQuantity((q) => q + 1)}
                                className="flex items-center justify-center w-10 h-10 text-xl text-gray-600 transition hover:bg-gray-50"
                            >
                                +
                            </button>
                        </div>

                        {/* Add to cart */}
                        <button
                            type="button"
                            onClick={handleAddToCart}
                            disabled={adding || loadingSlots}
                            className={`flex-1 h-10 rounded-xl font-semibold text-sm transition-all ${showSuccess
                                    ? "bg-green-500 text-white"
                                    : "bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50"
                                }`}
                        >
                            {showSuccess
                                ? "✓ Đã thêm vào giỏ!"
                                : adding
                                    ? "Đang thêm..."
                                    : `Thêm vào giỏ — ${(combo.price * quantity).toLocaleString("vi-VN")}₫`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}