"use client";
import ButtonCancel from "@/components/buttons/ButtonCancel";
import CloseIcon from "@/components/icons/CloseIcon";
import ValidatedInput from "@/components/input/ValidatedInput";
import ValidatedSelectInput from "@/components/input/ValidatedSelectInput";
import EditTableImage from "@/components/layout/EditTableImage";
import Loader from "@/components/loading/Loader";
import { API_CATEGORIES, API_COMBO_TYPES, STATUS_OPTIONS } from "@/constant/constant";
import { useFormValidate } from "@/hooks/useFormValidate";
import { uploadImage } from "@/libs/uploadImage";
import { validators } from "@/libs/validators";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function ComboTypeForm({ onSuccess, editData = null, setRedirectToItems }) {
    const isEdit = !!editData;
    const { errors, setErrors, registerRef, handleValidate, clearError } = useFormValidate();
    const [name, setName] = useState(editData?.name || "");
    const [image, setImage] = useState(editData?.image || "");
    const [status, setStatus] = useState(editData?.status || "on");
    const [savedData, setSavedData] = useState(editData);
    // slots: [{ category: categoryId, quantity: number, label: string }]
    const [slots, setSlots] = useState(
        editData?.slots?.map((s) => ({
            category: s.category?._id || s.category || "",
            quantity: s.quantity || 1,
            label: s.label || "",
        })) || []
    );

    const [pendingFile, setPendingFile] = useState(null);     // file chờ upload
    const [previewImage, setPreviewImage] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    // Load danh sách category
    useEffect(() => {
        fetch(API_CATEGORIES)
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
    }

    function updateSlot(idx, field, value) {
        if (loading) {
            return
        }
        setSlots((prev) =>
            prev.map((slot, i) => (i === idx ? { ...slot, [field]: value } : slot))
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

    function handleFileSelect(file, localPreview) {
        setPendingFile(file);
        setPreviewImage(localPreview);
    }

    async function handleSubmit(e) {
        if (loading) return;
        e.preventDefault();

        const isValid = handleValidate({
            name: {
                value: name,
                rules: [validators.required("tên loại combo"), validators.minLength(2), validators.maxLength(200)],
            },
            status: {
                value: status,
                rules: [validators.requiredSelect("trạng thái")],
            },
            image: {
                value: pendingFile || image,
                rules: [validators.required("ảnh loại combo")],
            },
        });

        const slotErrors = {};
        if (slots.length === 0) {
            slotErrors.slots = "Phải có ít nhất 1 slot";
        } else {
            for (let i = 0; i < slots.length; i++) {
                if (!slots[i].category) {
                    slotErrors.slots = `Slot ${i + 1}: chưa chọn danh mục`;
                    break;
                }
                if (!slots[i].quantity || slots[i].quantity < 1) {
                    slotErrors.slots = `Slot ${i + 1}: số lượng phải >= 1`;
                    break;
                }
            }
        }

        if (Object.keys(slotErrors).length > 0) {
            setErrors((prev) => ({ ...prev, ...slotErrors }));
        }

        if (!isValid || Object.keys(slotErrors).length > 0) return;

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
        const savingPromise = fetch(API_COMBO_TYPES, {
            method: isEdit ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...(isEdit && { _id: editData._id }),
                name, status, slots, image: finalImage,
            }),
        }).then(async (res) => {
            const text = await res.text(); // ✅ đọc text trước
            try {
                const data = JSON.parse(text);
                if (!res.ok) throw data;
                return data;
            } catch {
                // server trả HTML hoặc text lạ
                throw { message: `Lỗi server (${res.status})` };
            }
        });

        try {
            const data = await toast.promise(savingPromise, {
                loading: isEdit ? "Đang cập nhật loại combo..." : "Đang tạo loại combo...",
                success: isEdit ? "Cập nhật loại combo thành công!" : "Tạo loại combo thành công!",
                error: (err) => {
                    if (err?.errors && typeof err.errors === "object") {
                        setErrors((prev) => ({ ...prev, ...err.errors }));
                        return err?.message || "Dữ liệu không hợp lệ";
                    }
                    return err?.message || (isEdit ? "Cập nhật thất bại" : "Tạo loại combo thất bại");
                },
            });

            onSuccess?.(data);
            if (isEdit) {
                setSavedData(data); // ✅ cập nhật savedData với data mới từ server
                setImage(data.image || "");
                setPendingFile(null);
                setPreviewImage(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
                setName(""); setStatus("on"); setSlots([]);
                setPendingFile(null); setPreviewImage(null); setImage("");
                setRedirectToItems(true);

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
        setSlots(editData?.slots?.map((s) => ({
            category: s.category?._id || s.category || "",
            quantity: s.quantity || 1,
            label: s.label || "",
        })) || []);
        setStatus(editData?.status || STATUS_OPTIONS[0].value);
    }, [editData]);

    // ── handleCancel dùng savedData thay vì editData ──
    function handleCancel() {
        if (loading) return;
        if (previewImage) URL.revokeObjectURL(previewImage);
        setPendingFile(null);
        setPreviewImage(null);
        setImage(savedData?.image || "");
        setName(savedData?.name || "");
        setSlots(savedData?.slots?.map((s) => ({
            category: s.category?._id || s.category || "",
            quantity: s.quantity || 1,
            label: s.label || "",
        })) || []);
        setStatus(savedData?.status || STATUS_OPTIONS[0].value);
        clearError("name");
        clearError("status");
        clearError("image");
        clearError("slots");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <div className="rounded-lg">
            <div className="relative w-full h-[120px] group mb-4 mt-12 md:mt-8">
                <EditTableImage
                    classNameImage={"rounded-none"}
                    link={editData?.image}
                    previewLink={previewImage}
                    onFileSelect={handleFileSelect}
                    loadingForm={loading} />
            </div>
            {errors.image && (
                <span className="block mx-auto mt-2 text-xs text-center text-primary w-max">{errors.image}</span>
            )}
            <ValidatedInput
                label="Tên loại combo"
                name="name"
                value={name || ""}
                inputRef={registerRef("name")}
                error={errors.name}
                disabled={loading}
                placeholder="VD: Combo 1 1, Combo gia đình..."
                onChange={(e) => {
                    setName(e.target.value);
                    clearError("name");
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
                        className="flex items-center gap-1 text-sm font-semibold text-primary hover:text-red-700"
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
                    {errors.slots && (
                        <span className="block mt-1 text-xs text-primary">{errors.slots}</span>
                    )}
                    {slots.map((slot, idx) => (
                        <div
                            key={idx}
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
                                        className="p-1 text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                        title="Di chuyển lên"
                                    >
                                        ▲
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => moveSlot(idx, 1)}
                                        disabled={idx === slots.length - 1}
                                        className="p-1 text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                        title="Di chuyển xuống"
                                    >
                                        ▼
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => removeSlot(idx)}
                                        className="p-1 ml-1 text-xs text-primary hover:text-red-700"
                                        title="Xóa slot"
                                    >
                                        <CloseIcon />
                                    </button>
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
                                </div>

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
                                    <strong>{slot.label || cat?.name || "?"}</strong> — {slot.quantity} món
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
                <button onClick={handleSubmit} className={`flex items-center justify-center font-medium px-6 py-3 rounded-lg w-[220px] hover:opacity-80 hover:scale-[1.02] duration-500 ${loading ? "bg-[#DFE4EA] text-secondary pointer-events-none" : "bg-primary text-white pointer-events-auto"}`} type="submit" disabled={loading}>{loading ? <Loader size={20} /> : <span className='font-medium'>{isEdit ? "Cập Nhật Loại Combo" : "Lưu Loại Combo"}</span>}</button>
            </div>
        </div>
    );
}