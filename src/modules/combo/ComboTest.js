// { [categoryId]: MenuItem[] }
const [menuItemsByCategory, setMenuItemsByCategory] = useState({});

// ── Selections: mảng theo slot index ──────────────────────────────────
// selections[slotIdx] = [{ menuItemId, selectedSize }] (length = slot.quantity)
const [selections, setSelections] = useState([]);


// ── Khi chọn combo type → load menu items theo từng category trong slots
useEffect(() => {
    if (!editData?.comboType || comboTypes.length === 0) return;
    const id = editData.comboType?._id || editData.comboType; // string hoặc object
    const found = comboTypes.find((c) => c._id === id);
    if (!found) return;
    setSelectedComboType(found);

    // Rebuild selections từ items đã lưu
    if (editData?.items?.length > 0) {
        const rebuilt = found.slots.map((slot, slotIdx) => ({
            slotIndex: slotIdx,
            items: editData.items
                .filter((item) => item.slotIndex === slotIdx)
                .map((item) => ({
                    menuItemId: item.menuItem?._id || item.menuItem || "",
                    selectedSize: item.selectedSize || null,
                })),
        }));
        setSelections(rebuilt);
        setSavedData((prev) => ({ ...prev, _resolvedSelections: rebuilt, _resolvedComboType: found }));
    }
}, [editData, comboTypes]);
useEffect(() => {
    if (!selectedComboType) return;

    const isInitialLoad = isEdit &&
        (selectedComboType._id === (editData?.comboType?._id || editData?.comboType));

    if (!isInitialLoad) {
        // User tự đổi loại combo → reset selections
        setSelections(
            selectedComboType.slots.map((slot, idx) => ({
                slotIndex: idx,
                items: Array.from({ length: slot.quantity }, () => ({
                    menuItemId: "",
                    selectedSize: null,
                })),
            }))
        );
    }

    // Load menu items theo category
    const categoryIds = [
        ...new Set(selectedComboType.slots.map((s) => s.category?._id || s.category)),
    ];
    categoryIds.forEach((catId) => {
        if (!catId || menuItemsByCategory[catId]) return;
        fetch(`/api/menu-items?category=${catId}&status=on&all=true`)
            .then((r) => r.json())
            .then((d) =>
                setMenuItemsByCategory((prev) => ({ ...prev, [catId]: d.menuItems || [] }))
            );
    });
}, [selectedComboType]);


function updateItemSelection(slotIdx, itemIdx, field, value) {
    if (loading) return
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

//  validate in submit
// Validate selections
const selectionErrors = {};
for (const slot of selections) {
    for (const item of slot.items) {
        if (!item.menuItemId) {
            selectionErrors.selections = "Vui lòng chọn đủ món cho tất cả các slot";
            break;
        }
        const menuItem = getMenuItemById(item.menuItemId);
        if (menuItem?.sizes?.length > 0 && !item.selectedSize) {
            selectionErrors.selections = `Món "${menuItem.name}" cần chọn size`;
            break;
        }
    }
    if (selectionErrors.selections) break;
}
if (Object.keys(selectionErrors).length > 0) {
    setErrors((prev) => ({ ...prev, ...selectionErrors }));
}

// || Object.keys(selectionErrors).length > 0 trong if valid
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

        // ================================

// ── Helpers ────────────────────────────────────────────────────────────
function getMenuItemById(id) {
    for (const items of Object.values(menuItemsByCategory)) {
        const found = items.find((m) => m._id === id);
        if (found) return found;
    }
    return null;
}



// ====================================================
<div className="space-y-4">
    {/* Loại combo */}


    {/* Slots */}
    {selectedComboType && (
        <div className="mt-2 space-y-4">
            <h3 className="pb-2 font-semibold text-gray-800 border-b">Chọn Món Cho Combo</h3>
            {errors.selections && (
                <span className="block mt-2 text-xs text-center text-primary w-max">{errors.selections}</span>
            )}
            {selectedComboType.slots.map((slot, slotIdx) => {
                const categoryId = slot?.category?._id;
                const categoryItems = menuItemsByCategory[categoryId] || [];
                const slotSelection = selections.find((s) => s.slotIndex === slotIdx);

                return (
                    <div
                        key={slotIdx}
                        className="p-4 border border-gray-200 rounded-xl bg-gray-50"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
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
                                                className="flex-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                value={itemSel.menuItemId}
                                                disabled={loading}
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
                                                            ? `(có size) — ${mi.basePrice?.toLocaleString("vi-VN")}đ`
                                                            : `— ${mi.basePrice?.toLocaleString("vi-VN")}đ`}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Size picker — chỉ hiện khi món có sizes */}
                                        {hasSizes && (
                                            <div className="ml-6">
                                                <p className="my-2 text-xs italic font-medium text-primary">
                                                    *Lưu ý: Món này có nhiều size, vui lòng chọn 1 size:
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {chosenItem.sizes.map((sz) => {
                                                        const isSelected =
                                                            itemSel.selectedSize?.name === sz.name;
                                                        return (
                                                            <button
                                                                type="button"
                                                                key={sz.name}
                                                                disabled={loading}
                                                                onClick={() =>
                                                                    updateItemSelection(
                                                                        slotIdx,
                                                                        itemIdx,
                                                                        "selectedSize",
                                                                        { name: sz.name, price: sz.price }
                                                                    )
                                                                }
                                                                className={`px-3 py-1 rounded-lg text-sm border transition-all ${isSelected
                                                                    ? "bg-red-500 text-white border-red-500 font-semibold"
                                                                    : "bg-white text-gray-700 border-gray-300 hover:border-red-400"
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


</div>