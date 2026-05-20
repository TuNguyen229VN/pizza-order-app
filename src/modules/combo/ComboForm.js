"use client";
import ButtonCancel from "@/components/buttons/ButtonCancel";
import ValidatedInput from "@/components/input/ValidatedInput";
import ValidatedSelectInput from "@/components/input/ValidatedSelectInput";
import EditTableImage from "@/components/layout/EditTableImage";
import Loader from "@/components/loading/Loader";
import { API_COMBO, API_COMBO_TYPES, STATUS_OPTIONS } from "@/constant/constant";
import { useFormValidate } from "@/hooks/useFormValidate";
import { uploadImage } from "@/libs/uploadImage";
import { validators } from "@/libs/validators";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";


export default function ComboForm({ onSuccess, editData = null, }) {
    const isEdit = !!editData;
    const { errors, setErrors, registerRef, handleValidate, clearError } = useFormValidate();
    // ── State cơ bản ───────────────────────────────────────────────────────
    const [name, setName] = useState(editData?.name || "");
    const [image, setImage] = useState(editData?.image || "");
    const [price, setPrice] = useState(editData?.price || "");
    const [selectedComboType, setSelectedComboType] = useState(
        editData?.comboType || null
    );
    const [status, setStatus] = useState(editData?.status || STATUS_OPTIONS[0].value);
    const [pendingFile, setPendingFile] = useState(null);     // file chờ upload
    const [previewImage, setPreviewImage] = useState(null);
    const [savedData, setSavedData] = useState(editData);
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
        fetch(`${API_COMBO_TYPES}?all=true&status=on`)
            .then((r) => r.json())
            .then((d) => setComboTypes(d.comboTypes || []));
    }, []);

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
    // ── Helpers ────────────────────────────────────────────────────────────
    function getMenuItemById(id) {
        for (const items of Object.values(menuItemsByCategory)) {
            const found = items.find((m) => m._id === id);
            if (found) return found;
        }
        return null;
    }

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

    function handleFileSelect(file, localPreview) {
        if (loading) return;
        setPendingFile(file);
        setPreviewImage(localPreview);
    }
    // ── Submit ─────────────────────────────────────────────────────────────
    async function handleSubmit(e) {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        const isValid = handleValidate({
            name: {
                value: name,
                rules: [validators.required("tên combo"), validators.minLength(2), validators.maxLength(200)],
            },
            price: {
                value: price,
                rules: [validators.required("giá cơ bản"), validators.isNumber("giá cơ bản"), validators.minValue(1000), validators.maxValue(100000000)],
            },
            status: {
                value: status,
                rules: [validators.requiredSelect("trạng thái")],
            },
            selectedComboType: {
                value: selectedComboType,
                rules: [validators.requiredSelect("trạng thái")],
            },
            image: {
                value: pendingFile || image,
                rules: [validators.required("ảnh combo")],
            },
        });
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
        if (!isValid || Object.keys(selectionErrors).length > 0) {
            setLoading(false);
            return;
        };

        setLoading(true);

        // Upload ảnh nếu có file mới
        let finalImage = image;
        if (pendingFile) {
            try {
                finalImage = await uploadImage(pendingFile);
            } catch (error) {
                setLoading(false);
                toast.error(error.message);
                return;
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

        const savingPromise = fetch(API_COMBO, {
            method: isEdit ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...(isEdit && { _id: editData._id }),
                name, status, items, image: finalImage,
                price: Number(price),
                comboType: selectedComboType?._id,
            }),
        }).then(async (res) => {
            const text = await res.text();
            if (!text) throw { message: `Lỗi server (${res.status})` };
            let data;
            try {
                data = JSON.parse(text);
            } catch {
                throw { message: `Lỗi server (${res.status})` };  // ✅ chỉ catch JSON parse fail
            }

            if (!res.ok) throw data;  // ✅ throw ra ngoài catch, giữ nguyên error từ server
            return data;
        });

        try {
            const data = await toast.promise(savingPromise, {
                loading: isEdit ? "Đang cập nhật combo..." : "Đang tạo combo...",
                success: isEdit ? "Cập nhật combo thành công!" : "Tạo combo thành công!",
                error: (err) => {
                    if (err?.errors && typeof err.errors === "object") {
                        setErrors((prev) => ({ ...prev, ...err.errors }));
                        return err?.message || "Dữ liệu không hợp lệ";
                    }
                    return err?.message || (isEdit ? "Cập nhật thất bại" : "Tạo combo thất bại");
                },
            });

            onSuccess?.(data);
            if (isEdit) {
                setSavedData((prev) => ({
                    ...prev, ...data, image: finalImage,
                    _resolvedComboType: selectedComboType,  // ✅ giữ resolved
                    _resolvedSelections: selections,
                }));
                setImage(finalImage || "");
                setPendingFile(null);
                setPreviewImage(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
                setName(""); setStatus("on"); setSelections([]);
                setPendingFile(null); setPreviewImage(null);
                setImage(""); setPrice(""); setSelectedComboType(null);
            }
        } catch {
            // lỗi đã được toast.promise xử lý
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!editData) return;
        setImage(editData?.image || "");
        setName(editData?.name || "");
        setPrice(savedData?.price || "");
        setStatus(savedData?.status || STATUS_OPTIONS[0].value);
        // setSelectedComboType(savedData?.comboType || null);
        // setSelections(savedData?.items || []);
    }, [editData]);

    function handleCancel() {
        if (loading) return;
        if (previewImage) URL.revokeObjectURL(previewImage);
        setPendingFile(null);
        setPreviewImage(null);
        setImage(savedData?.image || "");
        setName(savedData?.name || "");
        setPrice(savedData?.price || "");
        setStatus(savedData?.status || STATUS_OPTIONS[0].value);
        setSelectedComboType(savedData?._resolvedComboType || null);
        setSelections(savedData?._resolvedSelections || []);
        clearError("name"); clearError("status"); clearError("price");
        clearError("image"); clearError("slots");
        clearError("selectedComboType"); clearError("selections");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <div className="rounded-lg">
            <div className="relative p-2 rounded-lg w-[200px] h-[200px] mx-auto group mt-12 md:mt-8">
                <EditTableImage
                    classNameImage={"rounded-none"}
                    link={image}
                    previewLink={previewImage}
                    onFileSelect={handleFileSelect}
                    loadingForm={loading} />
            </div>
            {errors.image && (
                <span className="block mx-auto mt-2 text-xs text-center text-primary w-max">{errors.image}</span>
            )}
            <ValidatedInput
                label="Tên combo"
                name="name"
                value={name || ""}
                inputRef={registerRef("name")}
                error={errors.name}
                disabled={loading}
                placeholder="Nhập tên combo"
                onChange={(e) => {
                    setName(e.target.value);
                    clearError("name");
                }}
            />
            <ValidatedInput
                label="Giá combo"
                name="price"
                value={price || ""}
                inputRef={registerRef("price")}
                error={errors.price}
                disabled={loading}
                placeholder="Nhập giá combo"
                onChange={(e) => {
                    setPrice(e.target.value);
                    clearError("price");
                }}
            />
            <ValidatedSelectInput
                label="Trạng thái"
                name="status"
                value={status}
                options={STATUS_OPTIONS}
                disabled={loading}
                inputRef={registerRef("status")}
                error={errors.status}
                onChange={(e) => { setStatus(e.target.value); clearError("status"); }}
            />

            <div className="space-y-4">
                {/* Loại combo */}
                <ValidatedSelectInput
                    label="Loại Combo"
                    name="selectedComboType"
                    value={selectedComboType?._id || ""}
                    options={[
                        { value: "", label: "-- Chọn loại combo --" },
                        ...comboTypes.map((c) => ({ value: c._id, label: c.name })),
                    ]}
                    disabled={loading}
                    inputRef={registerRef("selectedComboType")}
                    error={errors.selectedComboType}
                    onChange={(e) => {
                        const ct = comboTypes.find((c) => c?._id === e.target.value);
                        setSelectedComboType(ct || null); clearError("selectedComboType");
                    }}
                />

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

                {/* Submit */}
                <div className='flex justify-end gap-4 mt-4'>
                    <ButtonCancel loadingForm={loading} onClick={handleCancel} />
                    <button onClick={handleSubmit} className={`flex items-center justify-center font-medium px-6 py-3 rounded-lg w-[220px] hover:opacity-80 hover:scale-[1.02] duration-500 ${loading ? "bg-[#DFE4EA] text-secondary pointer-events-none" : "bg-primary text-white pointer-events-auto"}`} type="submit" disabled={loading}>{loading ? <Loader size={20} /> : <span className='font-medium'>{isEdit ? "Cập Nhật Combo" : "Lưu Combo"}</span>}</button>
                </div>
            </div>
        </div>
    );
}