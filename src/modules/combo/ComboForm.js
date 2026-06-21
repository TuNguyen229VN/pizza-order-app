"use client";
import ButtonCancel from "@/components/buttons/ButtonCancel";
import ValidatedInput from "@/components/input/ValidatedInput";
import ValidatedSelectInput from "@/components/input/ValidatedSelectInput";
import EditTableImage from "@/components/layout/EditTableImage";
import Loader from "@/components/loading/Loader";
import { API_CATEGORIES, API_COMBO, API_COMBO_TYPES, API_MENU_ITEMS, STATUS_OPTIONS } from "@/constant/constant";
import { useFormValidate } from "@/hooks/useFormValidate";
import { uploadImage } from "@/libs/uploadImage";
import { createValidators } from "@/libs/validators";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import ComboSlots from "./ComboSlots";
import ComboSummary from "./ComboSummary";
import { useTranslations } from "next-intl";
import { getLabel } from "@/utils/i18n-utils";


export default function ComboForm({ onSuccess, editData = null, setRedirectToItems }) {
    const isEdit = !!editData;
    const { errors, setErrors, registerRef, handleValidate, clearError } = useFormValidate();
    const sTrans = useTranslations("System");
    const t = useTranslations("Validation");
    const validators = createValidators(t);
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
    const [categoryItems, setCategoryItems] = useState({});
    const [pendingFile, setPendingFile] = useState(null);     // file chờ upload
    const [previewImage, setPreviewImage] = useState(null);
    const [savedData, setSavedData] = useState(editData);
    const [imageInputKey, setImageInputKey] = useState(0);

    const [slots, setSlots] = useState(
        editData?.slots?.map((s) => ({
            category: s.category?._id || s.category || "",
            quantity: s.quantity || 1,
            label: s.label || "",
            size: s.size ?? null,
            allowedItems: s.allowedItems?.map((id) => id?._id || id) || [],
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
        if (!categoryId || categorySizes[categoryId] !== undefined) return;
        try {
            const res = await fetch(`${API_MENU_ITEMS}?category=${categoryId}&status=on&all=true`);
            const data = await res.json();
            const items = data.menuItems || data || [];

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

            // Cache luôn toàn bộ items theo categoryId để dùng khi filter theo size
            setCategoryItems((prev) => ({ ...prev, [categoryId]: items }));
            setCategorySizes((prev) => ({
                ...prev,
                [categoryId]: Array.from(sizeMap.values()),
            }));
        } catch {
            setCategorySizes((prev) => ({ ...prev, [categoryId]: [] }));
            setCategoryItems((prev) => ({ ...prev, [categoryId]: [] }));
        }
    }

    // Lấy items của slot dựa vào category + size hiện tại
    function getItemsForSlot(slot) {
        const allItems = categoryItems[slot.category] || [];
        if (!slot.size?.name) return allItems; // chưa chọn size → show tất cả
        return allItems.filter((item) =>
            item.sizes?.some(
                (s) => s.name.trim().toLowerCase() === slot.size.name.trim().toLowerCase()
            )
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
                rules: [validators.required(sTrans("tên combo")), validators.minLength(2), validators.maxLength(200)],
            },
            price: {
                value: price,
                rules: [validators.required(sTrans("giá cơ bản")), validators.isNumber(sTrans("giá cơ bản")), validators.minValue(1000), validators.maxValue(100000000)],
            },
            status: {
                value: status,
                rules: [validators.requiredSelect(sTrans("trạng thái"))],
            },
            selectedComboType: {
                value: selectedComboType,
                rules: [validators.requiredSelect(sTrans("loại combo"))],
            },
            image: {
                value: pendingFile || image,
                rules: [validators.required(sTrans("ảnh combo"))],
            },
        });

        let hasSlotError = false;
        if (slots.length === 0) {
            setErrors((prev) => ({ ...prev, slots: sTrans("Phải có ít nhất 1 slot") }));
            hasSlotError = true;
        } else {
            const errs = slots.map((slot) => {
                const e = {};
                if (!slot.category) e.category = sTrans("Chưa chọn danh mục");
                if (!slot.quantity || slot.quantity < 1) e.quantity = sTrans("Số lượng phải lớn hơn 1");
                if (!slot.size?.name && categorySizes[slot.category]?.length > 0) e.size = sTrans("Chưa chọn size");
                if (!slot.allowedItems?.length) e.allowedItems = sTrans("Phải chọn ít nhất 1 món");
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
                toast.error(getLabel(sTrans, error.message));
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
            if (!text) throw { message: `${sTrans("Lỗi server")} (${res.status})` };
            let data;
            try {
                data = JSON.parse(text);
            } catch {
                throw { message: `${sTrans("Lỗi server")} (${res.status})` };  //  chỉ catch JSON parse fail
            }

            if (!res.ok) throw data;  //  throw ra ngoài catch, giữ nguyên error từ server
            return data;
        });

        try {
            const data = await toast.promise(savingPromise, {
                loading: isEdit ? sTrans("Đang cập nhật combo") : sTrans("Đang tạo combo"),
                success: isEdit ? sTrans("Cập nhật combo thành công") : sTrans("Tạo combo thành công"),
                error: (err) => {
                    if (err?.errors && typeof err.errors === "object") {
                        setErrors((prev) => ({ ...prev, ...err.errors }));
                        return getLabel(sTrans, err?.message) || sTrans("Dữ liệu không hợp lệ");
                    }
                    return getLabel(sTrans, err?.message) || (isEdit ? sTrans("Cập nhật thất bại") : sTrans("Tạo combo thất bại"));
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
        if (loading) return;
        setSlots((prev) =>
            prev.map((slot, i) => {
                if (i !== idx) return slot;
                const updated = { ...slot, [field]: value };
                if (field === "category") {
                    updated.size = null;
                    updated.allowedItems = [];
                    fetchSizesForCategory(value);
                }
                if (field === "size") {
                    updated.allowedItems = []; // reset khi đổi size
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



    // Thay useEffect([editData]) hiện tại bằng:
    useEffect(() => {
        editData?.slots?.forEach((s) => {
            const catId = s.category?._id || s.category;
            if (catId) fetchSizesForCategory(catId);
        });
    }, []);

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
            allowedItems: s.allowedItems?.map((id) => id?._id || id) || [],
        })));
        setImageInputKey((k) => k + 1);
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
                    key={imageInputKey}
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
                placeholder={sTrans("Nhập tên combo")}
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
                placeholder={sTrans("Nhập giá combo")}
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
                label="Loại combo"
                name="selectedComboType"
                value={selectedComboType?._id || ""}
                options={[
                    { value: "", label: "Chọn loại combo" },
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
                {/* Chon combo slots */}
                <ComboSlots slots={slots} addSlot={addSlot} moveSlot={moveSlot} loading={loading} removeSlot={removeSlot} updateSlot={updateSlot} categories={categories} categorySizes={categorySizes} getItemsForSlot={getItemsForSlot} errors={errors} slotRefs={slotRefs} slotErrors={slotErrors} />
            </div>

            {/* Preview tóm tắt */}
            <ComboSummary slots={slots} categories={categories} />

            {/* Submit */}
            <div className='flex justify-end gap-4 mt-4'>
                <ButtonCancel loadingForm={loading} onClick={handleCancel} />
                <button onClick={handleSubmit} className={`flex items-center justify-center font-medium px-6 py-3 rounded-lg w-[220px] hover:opacity-80 hover:scale-[1.02] duration-500 ${loading ? "bg-[#DFE4EA] text-secondary pointer-events-none" : "bg-primary text-white pointer-events-auto"}`} type="submit" disabled={loading}>{loading ? <Loader size={20} /> : <span className='font-medium'>{isEdit ? sTrans("Cập nhật combo") : sTrans("Lưu combo")}</span>}</button>
            </div>
        </div>
    );
}