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

    const [pendingFile, setPendingFile] = useState(null);     // file chờ upload
    const [previewImage, setPreviewImage] = useState(null);

    const [loading, setLoading] = useState(false);

    function handleFileSelect(file, localPreview) {
        setPendingFile(file);
        setPreviewImage(localPreview);
    }

    async function handleSubmit(e) {
        if (loading) return;
        e.preventDefault();
        setLoading(true);
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


        if (!isValid) {
            setLoading(false);
            return;
        }

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
                name, status, image: finalImage,
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
                setSavedData(prev => ({ ...prev, ...data, image: finalImage })); // ✅ cập nhật savedData với data mới từ server
                setImage(finalImage || "");
                setPendingFile(null);
                setPreviewImage(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
                setName(""); setStatus("on");
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
        setStatus(savedData?.status || STATUS_OPTIONS[0].value);
        clearError("name");
        clearError("status");
        clearError("image");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <div className="rounded-lg">
            <div className="relative w-full h-[120px] group mb-4 mt-12 md:mt-8">
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

            {/* Submit */}
            <div className='flex justify-end gap-4 mt-4'>
                <ButtonCancel loadingForm={loading} onClick={handleCancel} />
                <button onClick={handleSubmit} className={`flex items-center justify-center font-medium px-6 py-3 rounded-lg w-[220px] hover:opacity-80 hover:scale-[1.02] duration-500 ${loading ? "bg-[#DFE4EA] text-secondary pointer-events-none" : "bg-primary text-white pointer-events-auto"}`} type="submit" disabled={loading}>{loading ? <Loader size={20} /> : <span className='font-medium'>{isEdit ? "Cập Nhật Loại Combo" : "Lưu Loại Combo"}</span>}</button>
            </div>
        </div>
    );
}