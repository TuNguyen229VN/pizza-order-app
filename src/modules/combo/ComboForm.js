"use client";
import ButtonCancel from "@/components/buttons/ButtonCancel";
import CloseIcon from "@/components/icons/CloseIcon";
import ValidatedInput from "@/components/input/ValidatedInput";
import ValidatedSelectInput from "@/components/input/ValidatedSelectInput";
import EditTableImage from "@/components/layout/EditTableImage";
import Loader from "@/components/loading/Loader";
import ConfirmPopup from "@/components/popup/ConfirmPopup";
import { API_CATEGORIES, API_COMBO, API_COMBO_TYPES, API_MENU_ITEMS, STATUS_OPTIONS } from "@/constant/constant";
import { useFormValidate } from "@/hooks/useFormValidate";
import { uploadImage } from "@/libs/uploadImage";
import { validators } from "@/libs/validators";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";


export default function ComboForm({ onSuccess, editData = null, setRedirectToItems }) {
    const isEdit = !!editData;
    const { errors, setErrors, registerRef, handleValidate, clearError } = useFormValidate();

    const slotRefs = useRef([]);
    const [slotErrors, setSlotErrors] = useState([]);
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

    const [slots, setSlots] = useState(
        editData?.slots?.map((s) => ({
            category: s.category?._id || s.category || "",
            quantity: s.quantity || 1,
            label: s.label || "",
            size: s.size ?? null,
        })) || []
    );

    const [categories, setCategories] = useState([]);
    const [categorySizes, setCategorySizes] = useState({});
    // ── Dữ liệu từ API ─────────────────────────────────────────────────────
    const [comboTypes, setComboTypes] = useState([]);

    const [loading, setLoading] = useState(false);

    // ── Load combo types ───────────────────────────────────────────────────
    useEffect(() => {
        fetch(`${API_COMBO_TYPES}?all=true&status=on`)
            .then((r) => r.json())
            .then((d) => setComboTypes(d.comboTypes || []));
    }, []);

    async function fetchSizesForCategory(categoryId) {
        if (!categoryId || categorySizes[categoryId]) return; // đã cache rồi thì thôi
        try {
            const res = await fetch(`${API_MENU_ITEMS}?category=${categoryId}&status=on&all=true`);
            const data = await res.json();
            const items = data.menuItems || data || [];

            // Gom sizes unique theo name
            const sizeMap = new Map();
            for (const item of items) {
                for (const s of item.sizes || []) {
                    if (s.name) {
                        const key = `${s.name.trim().toLowerCase()}_${s.price || 0}`;
                        if (!sizeMap.has(key)) {
                            sizeMap.set(key, { name: s.name.trim(), price: s.price || 0 });
                        }
                    }
                }
            }
            setCategorySizes((prev) => ({
                ...prev,
                [categoryId]: Array.from(sizeMap.values()),
            }));
        } catch {
            setCategorySizes((prev) => ({ ...prev, [categoryId]: [] }));
        }
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
                rules: [validators.requiredSelect("loại combo")],
            },
            image: {
                value: pendingFile || image,
                rules: [validators.required("ảnh combo")],
            },
        });

        let hasSlotError = false;
        if (slots.length === 0) {
            setErrors((prev) => ({ ...prev, slots: "Phải có ít nhất 1 slot" }));
            hasSlotError = true;
        } else {
            const errs = slots.map((slot) => {
                const e = {};
                if (!slot.category) e.category = "Chưa chọn danh mục";
                if (!slot.quantity || slot.quantity < 1) e.quantity = "Số lượng phải >= 1";
                if (!slot.size?.name && categorySizes[slot.category]?.length > 0) e.size = "Chưa chọn size";
                return e;
            });

            const anyError = errs.some((e) => Object.keys(e).length > 0);
            if (anyError) {
                setSlotErrors(errs);
                hasSlotError = true;
                // Scroll tới slot đầu tiên có lỗi
                setTimeout(() => {
                    const firstErrIdx = errs.findIndex((e) => Object.keys(e).length > 0);
                    slotRefs.current[firstErrIdx]?.scrollIntoView({ behavior: "smooth", block: "center" });
                }, 50);
            } else {
                setSlotErrors([]);
            }
        }

        if (!isValid || hasSlotError) {
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

        const savingPromise = fetch(API_COMBO, {
            method: isEdit ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...(isEdit && { _id: editData._id }),
                name, status, image: finalImage,
                price: Number(price),
                comboType: selectedComboType?._id, slots
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
                    slots: slots,
                    comboType: selectedComboType,
                    // _resolvedComboType: selectedComboType,  // ✅ giữ resolved
                    // _resolvedSelections: selections,
                }));
                setImage(finalImage || "");
                setPendingFile(null);
                setPreviewImage(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
                setName(""); setStatus("on"); setSlots([]);
                setPendingFile(null); setPreviewImage(null);
                setImage(""); setPrice("");
                setSelectedComboType(null);
                setRedirectToItems(true);
            }
        } catch {
            // lỗi đã được toast.promise xử lý
        } finally {
            setLoading(false);
        }
    }


    // Load danh sách category
    useEffect(() => {
        fetch(`${API_CATEGORIES}?all=true&statusFilter=on`)
            .then((r) => r.json())
            .then((d) => setCategories(d.categories || d || []));
    }, []);


    // ── Slot helpers ───────────────────────────────────────────────────────
    function addSlot() {
        if (loading) return
        setSlots((prev) => [...prev, { category: "", quantity: 1, label: "" }]);
        clearError("slots");
    }

    function removeSlot(idx) {
        if (loading) return;
        setSlots((prev) => prev.filter((_, i) => i !== idx));
        setSlotErrors((prev) => prev.filter((_, i) => i !== idx));
    }

    function updateSlot(idx, field, value) {
        if (loading) {
            return
        }
        // setSlots((prev) =>
        //     prev.map((slot, i) => (i === idx ? { ...slot, [field]: value } : slot))
        // );
        setSlots((prev) =>
            prev.map((slot, i) => {
                if (i !== idx) return slot;
                const updated = { ...slot, [field]: value };
                // Reset size khi đổi category
                if (field === "category") {
                    updated.size = null;
                    fetchSizesForCategory(value); // ← fetch sizes mới
                }
                return updated;
            })
        );
        clearError("slots");
    }

    function moveSlot(idx, dir) {
        if (loading) return
        setSlots((prev) => {
            const arr = [...prev];
            const target = idx + dir;
            if (target < 0 || target >= arr.length) return arr;
            [arr[idx], arr[target]] = [arr[target], arr[idx]];
            return arr;
        });
    }



    useEffect(() => {
        if (!editData) return;
        setImage(editData?.image || "");
        setName(editData?.name || "");
        setPrice(savedData?.price || "");
        setStatus(savedData?.status || STATUS_OPTIONS[0].value);
        setSlots(editData?.slots?.map((s) => ({
            category: s.category?._id || s.category || "",
            quantity: s.quantity || 1,
            label: s.label || "",
            size: s.size ?? null,
        })) || []);
        setSelectedComboType(savedData?.comboType || null);
        editData?.slots?.forEach((s) => {
            const catId = s.category?._id || s.category;
            if (catId) fetchSizesForCategory(catId);
        });
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
        setSelectedComboType(savedData?.comboType || null);
        setSlots((savedData?.slots || []).map((s) => ({
            category: s.category?._id || s.category || "",
            quantity: s.quantity || 1, label: s.label || "", size: s.size || null,
        })));
        // setSelections(savedData?._resolvedSelections || []);
        clearError("name"); clearError("status"); clearError("price");
        clearError("image"); clearError("slots");
        clearError("selectedComboType");
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
            <div>
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

                <div className="space-y-3">
                    {slots.map((slot, idx) => (
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
                                        disabled={idx === 0}
                                        className={`p-1 text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30 ${loading ? "pointer-events-none" : "cursor-pointer"}`}
                                        title="Di chuyển lên"
                                    >
                                        ▲
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => moveSlot(idx, 1)}
                                        disabled={idx === slots.length - 1}
                                        className={`p-1 text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30 ${loading ? "pointer-events-none" : "cursor-pointer"}`}
                                        title="Di chuyển xuống"
                                    >
                                        ▼
                                    </button>
                                    <ConfirmPopup onDelete={() => removeSlot(idx)}>
                                        <button
                                        type="button"
                                        
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
                                        {categorySizes[slot.category] === undefined ? (
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
                    ))}

                </div>
            </div>

            {/* Preview tóm tắt */}
            {slots.length > 0 && (
                <div className="p-3 mt-4 text-[#333] text-sm border border-gray-200 bg-red-50 rounded-xl">
                    <p className="mb-1 font-medium">Tóm tắt combo:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                        {slots.map((slot, idx) => {
                            const cat = categories.find((c) => c._id === slot.category);
                            return (
                                <li key={idx}>
                                    <strong>{slot.label || cat?.name || "?"}</strong>  {slot.size?.name ? ` [${slot.size.name}]` : ""} — {slot.quantity} món
                                    {cat && slot.label && cat.name !== slot.label ? ` (${cat.name})` : ""}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            {/* Submit */}
            <div className='flex justify-end gap-4 mt-4'>
                <ButtonCancel loadingForm={loading} onClick={handleCancel} />
                <button onClick={handleSubmit} className={`flex items-center justify-center font-medium px-6 py-3 rounded-lg w-[220px] hover:opacity-80 hover:scale-[1.02] duration-500 ${loading ? "bg-[#DFE4EA] text-secondary pointer-events-none" : "bg-primary text-white pointer-events-auto"}`} type="submit" disabled={loading}>{loading ? <Loader size={20} /> : <span className='font-medium'>{isEdit ? "Cập Nhật Combo" : "Lưu Combo"}</span>}</button>
            </div>
        </div>
    );
}