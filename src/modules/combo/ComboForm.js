"use client";
import { useEffect, useState } from "react";


export default function ComboForm({ onSuccess }) {
    // ── State cơ bản ───────────────────────────────────────────────────────
    const [name, setName] = useState("");
    const [image, setImage] = useState("");
    const [price, setPrice] = useState("");
    const [selectedComboType, setSelectedComboType] = useState(null);

    // ── Dữ liệu từ API ─────────────────────────────────────────────────────
    const [comboTypes, setComboTypes] = useState([]);
    // { [categoryId]: MenuItem[] }
    const [menuItemsByCategory, setMenuItemsByCategory] = useState({});

    // ── Selections: mảng theo slot index ──────────────────────────────────
    // selections[slotIdx] = [{ menuItemId, selectedSize }] (length = slot.quantity)
    const [selections, setSelections] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ── Load combo types ───────────────────────────────────────────────────
    useEffect(() => {
        fetch("/api/combo-type")
            .then((r) => r.json())
            .then((d) => setComboTypes(d.comboTypes || []));
    }, []);

    // ── Khi chọn combo type → load menu items theo từng category trong slots
    useEffect(() => {
        if (!selectedComboType) return;
        setSelections(
            selectedComboType.slots.map((slot) => ({
                slotIndex: selectedComboType.slots.indexOf(slot),
                items: Array.from({ length: slot.quantity }, () => ({
                    menuItemId: "",
                    selectedSize: null,
                })),
            }))
        );

        const categoryIds = [...new Set(selectedComboType.slots.map((s) => s.category._id))];
        categoryIds.forEach((catId) => {
            if (menuItemsByCategory[catId]) return;
            fetch(`/api/menu-items?category=${catId}&status=on&all=true`)
                .then((r) => r.json())
                .then((d) =>
                    setMenuItemsByCategory((prev) => ({ ...prev, [catId]: d.menuItems || [] }))
                );
        });
    }, [selectedComboType]);

    // ── Helpers ────────────────────────────────────────────────────────────
    function getMenuItemById(id) {
        for (const items of Object.values(menuItemsByCategory)) {
            const found = items.find((m) => m._id === id);
            if (found) return found;
        }
        return null;
    }

    function updateItemSelection(slotIdx, itemIdx, field, value) {
        setSelections((prev) =>
            prev.map((slot) => {
                if (slot.slotIndex !== slotIdx) return slot;
                const newItems = slot.items.map((item, i) => {
                    if (i !== itemIdx) return item;
                    if (field === "menuItemId") {
                        // Reset size khi đổi món
                        return { menuItemId: value, selectedSize: null };
                    }
                    return { ...item, [field]: value };
                });
                return { ...slot, items: newItems };
            })
        );
    }

    // ── Submit ─────────────────────────────────────────────────────────────
    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccess("");

        // Validate selections
        for (const slot of selections) {
            for (const item of slot.items) {
                if (!item.menuItemId) {
                    setError("Vui lòng chọn đủ món cho tất cả các slot");
                    return;
                }
                const menuItem = getMenuItemById(item.menuItemId);
                if (menuItem?.sizes?.length > 0 && !item.selectedSize) {
                    setError(`Món "${menuItem.name}" cần chọn size`);
                    return;
                }
            }
        }

        // Build items array
        const items = [];
        selections.forEach((slot) => {
            slot.items.forEach((item) => {
                items.push({
                    menuItem: item.menuItemId,
                    selectedSize: item.selectedSize || undefined,
                    slotIndex: slot.slotIndex,
                    quantity: 1,
                });
            });
        });

        setLoading(true);
        try {
            const res = await fetch("/api/combo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    image,
                    price: Number(price),
                    comboType: selectedComboType._id,
                    items,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || "Có lỗi xảy ra");
            } else {
                setSuccess("Tạo combo thành công!");
                onSuccess?.(data);
                // Reset form
                setName("");
                setImage("");
                setPrice("");
                setSelectedComboType(null);
                setSelections([]);
            }
        } catch {
            setError("Không thể kết nối server");
        } finally {
            setLoading(false);
        }
    }

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <div className="max-w-2xl p-6 mx-auto bg-white shadow rounded-2xl">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">Tạo Combo Mới</h2>

            {error && (
                <div className="p-3 mb-4 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
                    {error}
                </div>
            )}
            {success && (
                <div className="p-3 mb-4 text-sm text-green-700 border border-green-200 rounded-lg bg-green-50">
                    {success}
                </div>
            )}

            <div className="space-y-4">
                {/* Tên */}
                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Tên Combo *</label>
                    <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="VD: Combo 1 người"
                    />
                </div>

                {/* Hình ảnh */}
                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">URL Hình Ảnh</label>
                    <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        placeholder="https://..."
                    />
                    {image && (
                        <img src={image} alt="preview" className="object-cover w-24 h-24 mt-2 border rounded-lg" />
                    )}
                </div>

                {/* Giá */}
                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Giá Combo (VNĐ) *</label>
                    <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="VD: 199000"
                        min={0}
                    />
                </div>

                {/* Loại combo */}
                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Loại Combo *</label>
                    <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                        value={selectedComboType?._id || ""}
                        onChange={(e) => {
                            const ct = comboTypes.find((c) => c._id === e.target.value);
                            setSelectedComboType(ct || null);
                        }}
                    >
                        <option value="">-- Chọn loại combo --</option>
                        {comboTypes.map((ct) => (
                            <option key={ct._id} value={ct._id}>
                                {ct.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Slots */}
                {selectedComboType && (
                    <div className="mt-2 space-y-4">
                        <h3 className="pb-2 font-semibold text-gray-800 border-b">Chọn Món Cho Combo</h3>
                        {selectedComboType.slots.map((slot, slotIdx) => {
                            const categoryId = slot.category._id;
                            const categoryItems = menuItemsByCategory[categoryId] || [];
                            const slotSelection = selections.find((s) => s.slotIndex === slotIdx);

                            return (
                                <div
                                    key={slotIdx}
                                    className="p-4 border border-gray-200 rounded-xl bg-gray-50"
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                            Slot {slotIdx + 1}
                                        </span>
                                        <span className="font-medium text-gray-700">
                                            {slot.label || slot.category.name} — chọn{" "}
                                            <strong>{slot.quantity}</strong> món
                                        </span>
                                    </div>

                                    {categoryItems.length === 0 ? (
                                        <p className="text-sm italic text-gray-400">
                                            Đang tải món hoặc không có món nào đang bật trong danh mục này...
                                        </p>
                                    ) : (
                                        slotSelection?.items.map((itemSel, itemIdx) => {
                                            const chosenItem = itemSel.menuItemId
                                                ? getMenuItemById(itemSel.menuItemId)
                                                : null;
                                            const hasSizes = chosenItem?.sizes?.length > 0;

                                            return (
                                                <div
                                                    key={itemIdx}
                                                    className="flex flex-col gap-2 mb-3"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {slot.quantity > 1 && (
                                                            <span className="w-5 text-xs text-gray-400">
                                                                {itemIdx + 1}.
                                                            </span>
                                                        )}
                                                        <select
                                                            className="flex-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                                                            value={itemSel.menuItemId}
                                                            onChange={(e) =>
                                                                updateItemSelection(
                                                                    slotIdx,
                                                                    itemIdx,
                                                                    "menuItemId",
                                                                    e.target.value
                                                                )
                                                            }
                                                        >
                                                            <option value="">
                                                                -- Chọn từ {slot.category.name} --
                                                            </option>
                                                            {categoryItems.map((mi) => (
                                                                <option key={mi._id} value={mi._id}>
                                                                    {mi.name}{" "}
                                                                    {mi.sizes?.length > 0
                                                                        ? "(có size)"
                                                                        : `— ${mi.basePrice?.toLocaleString("vi-VN")}đ`}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Size picker — chỉ hiện khi món có sizes */}
                                                    {hasSizes && (
                                                        <div className="ml-6">
                                                            <p className="mb-1 text-xs font-medium text-orange-600">
                                                                ⚠️ Món này có nhiều size, vui lòng chọn 1 size:
                                                            </p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {chosenItem.sizes.map((sz) => {
                                                                    const isSelected =
                                                                        itemSel.selectedSize?.name === sz.name;
                                                                    return (
                                                                        <button
                                                                            type="button"
                                                                            key={sz.name}
                                                                            onClick={() =>
                                                                                updateItemSelection(
                                                                                    slotIdx,
                                                                                    itemIdx,
                                                                                    "selectedSize",
                                                                                    { name: sz.name, price: sz.price }
                                                                                )
                                                                            }
                                                                            className={`px-3 py-1 rounded-lg text-sm border transition-all ${isSelected
                                                                                    ? "bg-orange-500 text-white border-orange-500 font-semibold"
                                                                                    : "bg-white text-gray-700 border-gray-300 hover:border-orange-400"
                                                                                }`}
                                                                        >
                                                                            {sz.name} —{" "}
                                                                            {sz.price?.toLocaleString("vi-VN")}đ
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Submit */}
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full py-3 mt-2 font-semibold text-white transition-colors bg-orange-500 hover:bg-orange-600 disabled:opacity-50 rounded-xl"
                >
                    {loading ? "Đang tạo..." : "Tạo Combo"}
                </button>
            </div>
        </div>
    );
}