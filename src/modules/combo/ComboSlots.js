import CloseIcon from '@/components/icons/CloseIcon';
import ConfirmPopup from '@/components/popup/ConfirmPopup';
import Image from 'next/image';
import React from 'react'

export default function ComboSlots({
    slots = [],
    moveSlot,
    loading,
    addSlot,
    removeSlot,
    updateSlot,
    categories = [],
    categorySizes = [],
    getItemsForSlot,
    errors = {},
    slotRefs,
    slotErrors = [],
}) {
    return (
        <>
            <div className="flex items-center justify-between mt-4 mb-2">
                <label className="block text-sm font-medium text-gray-700">
                    Slots <span className="text-red-500">*</span>
                </label>
                <button
                    type="button"
                    onClick={addSlot}
                    disabled={loading}
                    className={`flex items-center gap-1 text-sm font-semibold text-primary hover:text-red-700 ${loading ? "pointer-events-none" : "cursor-pointer"}`}
                >
                    + Thêm slot
                </button>
            </div>

            {slots.length === 0 && (
                <div className="p-6 text-sm text-center text-gray-400 border-2 border-gray-200 border-dashed rounded-xl">
                    Chưa có slot nào. Nhấn &quot;+ Thêm slot&quot; để bắt đầu.
                </div>
            )}
            {errors.slots && (
                <span className="block mt-1 text-xs text-primary">{errors.slots}</span>
            )}
            <div className='space-y-3'>
                {
                    slots.map((slot, idx) => (
                        <div
                            key={idx}
                            ref={(el) => (slotRefs.current[idx] = el)}
                            className="relative p-4 border border-gray-200 rounded-xl"
                        >
                            {/* Header slot */}
                            <div className="flex items-center justify-between mb-3">
                                <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                    Slot {idx + 1}
                                </span>
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => moveSlot(idx, -1)}
                                        disabled={loading || idx === 0}
                                        className={`p-1 text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30 ${loading ? "pointer-events-none" : "cursor-pointer"}`}
                                        title="Di chuyển lên"
                                    >
                                        ▲
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => moveSlot(idx, 1)}
                                        disabled={loading || idx === slots.length - 1}
                                        className={`p-1 text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30 ${loading ? "pointer-events-none" : "cursor-pointer"}`}
                                        title="Di chuyển xuống"
                                    >
                                        ▼
                                    </button>
                                    <ConfirmPopup onDelete={() => removeSlot(idx)}>
                                        <button
                                            type="button"
                                            disabled={loading}
                                            className={`p-1 ml-1 text-xs text-primary hover:text-red-700 ${loading ? "pointer-events-none" : "cursor-pointer"}`}
                                            title="Xóa slot"
                                        >
                                            <CloseIcon />
                                        </button>
                                    </ConfirmPopup>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {/* Danh mục */}
                                <div className="col-span-2">
                                    <label className="block mb-1 text-xs text-gray-500">
                                        Danh mục <span className="text-red-400">*</span>
                                    </label>
                                    <select
                                        className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        value={slot.category}
                                        disabled={loading}
                                        onChange={(e) => updateSlot(idx, "category", e.target.value)}
                                    >
                                        <option value="">-- Chọn danh mục --</option>
                                        {categories.map((cat) => (
                                            <option key={cat._id} value={cat._id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                    {slotErrors[idx]?.category && (
                                        <span className="block mt-1 text-xs text-primary">{slotErrors[idx].category}</span>
                                    )}
                                </div>

                                {/* Size */}
                                {slot.category && (
                                    <div className="col-span-2">
                                        <label className="block mb-1 text-xs text-gray-500">
                                            Size <span className="text-red-400">*</span>
                                        </label>
                                        {categorySizes?.[slot.category] === undefined ? (
                                            <p className="text-xs italic text-gray-400">Đang tải sizes...</p>
                                        ) : categorySizes[slot.category].length === 0 ? (
                                            <p className="text-xs italic text-gray-400">
                                                Danh mục này không có size nào
                                            </p>
                                        ) : (
                                            <select
                                                className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                value={slot.size ? `${slot.size.name}||${slot.size.price || 0}` : ""}
                                                disabled={loading}
                                                onChange={(e) => {
                                                    const lastIdx = e.target.value.lastIndexOf("||");
                                                    const name = e.target.value.slice(0, lastIdx);
                                                    const price = e.target.value.slice(lastIdx + 2);
                                                    const picked = categorySizes[slot.category]?.find(
                                                        (s) => s.name.trim().toLowerCase() === name.trim().toLowerCase()
                                                            && String(s.price || 0) === price
                                                    );
                                                    updateSlot(idx, "size", picked || null); // ← THÊM
                                                }}
                                            >
                                                <option value="">-- Chọn size --</option>
                                                {categorySizes[slot.category].map((s) => (
                                                    <option key={`${s.name}||${s.price}`} value={`${s.name}||${s.price}`}>
                                                        {s.name}{s.price > 0 ? ` (+${s.price.toLocaleString("vi-VN")}đ)` : ""}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                        {slotErrors[idx]?.size && (
                                            <span className="block mt-1 text-xs text-primary">{slotErrors[idx].size}</span>
                                        )}
                                    </div>
                                )}

                                {/* Item Picker — hiện sau khi đã chọn category */}
                                {slot.category && (() => {
                                    const items = getItemsForSlot(slot);
                                    const allowedIds = slot.allowedItems || [];
                                    const allSelected = items.length > 0 && items.every((item) =>
                                        allowedIds.includes(item._id)
                                    );

                                    return (
                                        <div className="col-span-2">
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="text-xs text-gray-500">
                                                    Món được chọn <span className="text-red-400">*</span>
                                                    <span className="ml-1 text-gray-400">
                                                        ({allowedIds.length}/{items.length})
                                                    </span>
                                                </label>
                                                <button
                                                    type="button"
                                                    disabled={loading || items.length === 0}
                                                    onClick={() => {
                                                        const newIds = allSelected
                                                            ? []
                                                            : items.map((item) => item._id);
                                                        updateSlot(idx, "allowedItems", newIds);
                                                    }}
                                                    className="text-xs font-semibold text-primary hover:text-red-700 disabled:opacity-40"
                                                >
                                                    {allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                                                </button>
                                            </div>

                                            {items.length === 0 ? (
                                                <p className="text-xs italic text-gray-400">
                                                    {categorySizes[slot.category] === undefined
                                                        ? "Đang tải..."
                                                        : "Không có món nào phù hợp"}
                                                </p>
                                            ) : (
                                                <div className="overflow-y-auto border border-gray-200 divide-y divide-gray-100 rounded-lg max-h-48">
                                                    {items.map((item) => {
                                                        const checked = allowedIds.includes(item._id);
                                                        return (
                                                            <label
                                                                key={item._id}
                                                                className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-red-50 transition-colors ${checked ? "bg-red-50" : ""
                                                                    }`}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    disabled={loading}
                                                                    checked={checked}
                                                                    onChange={() => {
                                                                        const next = checked
                                                                            ? allowedIds.filter((id) => id !== item._id)
                                                                            : [...allowedIds, item._id];
                                                                        updateSlot(idx, "allowedItems", next);
                                                                    }}
                                                                    className="flex-shrink-0 w-4 h-4 accent-primary"
                                                                />
                                                                {item.image && (
                                                                    <Image
                                                                        src={item.image}
                                                                        alt={item.name}
                                                                        width={200}
                                                                        height={200}
                                                                        className="flex-shrink-0 object-cover w-8 h-8 rounded"
                                                                    />
                                                                )}
                                                                <span className="truncate">{item.name}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                            {slotErrors[idx]?.allowedItems && (
                                                <span className="block mt-1 text-xs text-primary">
                                                    {slotErrors[idx].allowedItems}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })()}

                                {/* Label */}
                                <div>
                                    <label className="block mb-1 text-xs text-gray-500">
                                        Nhãn hiển thị
                                    </label>
                                    <input
                                        className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        value={slot.label}
                                        disabled={loading}
                                        onChange={(e) => updateSlot(idx, "label", e.target.value)}
                                        placeholder="VD: Pizza, Đồ uống..."
                                    />
                                </div>

                                {/* Số lượng */}
                                <div>
                                    <label className="block mb-1 text-xs text-gray-500">
                                        Số lượng <span className="text-red-400">*</span>
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <button
                                            disabled={loading}
                                            type="button"
                                            onClick={() =>
                                                updateSlot(idx, "quantity", Math.max(1, slot.quantity - 1))
                                            }
                                            className="flex items-center justify-center w-8 h-8 text-lg font-bold leading-none text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
                                        >
                                            −
                                        </button>
                                        <span className="w-8 font-semibold text-center text-gray-800">
                                            {slot.quantity}
                                        </span>
                                        <button
                                            disabled={loading}
                                            type="button"
                                            onClick={() => updateSlot(idx, "quantity", slot.quantity + 1)}
                                            className="flex items-center justify-center w-8 h-8 text-lg font-bold leading-none text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
                                        >
                                            +
                                        </button>
                                    </div>
                                    {slotErrors[idx]?.quantity && (
                                        <span className="block mt-1 text-xs text-primary">{slotErrors[idx].quantity}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                }
            </div>
        </>
    )
}
