import { validateForm, validators } from "./validators";

export function validateCombo(data, categorySizes = {}) {
    const { isValid, errors } = validateForm({
        name: {
            value: data.name,
            rules: [validators.required("tên combo"), validators.minLength(2), validators.maxLength(200)],
        },
        price: {
            value: data.price,
            rules: [validators.required("giá cơ bản"), validators.isNumber("giá cơ bản"), validators.minValue(1000), validators.maxValue(100000000)],
        },
        status: {
            value: data.status,
            rules: [validators.requiredSelect("trạng thái")],
        },
        selectedComboType: {
            value: data.comboType,
            rules: [validators.requiredSelect("trạng thái")],
        },
        image: {
            value: data.image,
            rules: [validators.required("ảnh combo")],
        },
    });

    let slotErrors = {};
    if (!data.slots || data.slots.length === 0) {
        slotErrors.slots = "Phải có ít nhất 1 slot";
    } else {
        const perSlotErrors = data.slots.map((slot) => {
            const e = {};
            if (!slot.category) e.category = "Chưa chọn danh mục";
            if (!slot.quantity || slot.quantity < 1) e.quantity = "Số lượng phải >= 1";
            // Chỉ bắt buộc size nếu category đó có sizes
            if (!slot.size?.name && categorySizes[slot.category]?.length > 0) {
                e.size = "Chưa chọn size";
            }
            return e;
        });

        const hasError = perSlotErrors.some((e) => Object.keys(e).length > 0);
        if (hasError) {
            slotErrors.perSlot = perSlotErrors; // mảng lỗi theo index
        }
    }

    const mergedErrors = { ...errors, ...slotErrors };

    return {
        isValid: isValid && Object.keys(slotErrors).length === 0, // ✅ cả 2 phải valid
        errors: mergedErrors,
    };

}