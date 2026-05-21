import { validateForm, validators } from "./validators";

export function validateComboType(data) {
    // const slotErrors = {};
    // if (!data.slots || data.slots.length === 0) {
    //     slotErrors.slots = "Phải có ít nhất 1 slot";
    // } else {
    //     for (let i = 0; i < data.slots.length; i++) {
    //         if (!data.slots[i].category) {
    //             slotErrors.slots = `Slot ${i + 1}: chưa chọn danh mục`;
    //             break;
    //         }
    //         if (!data.slots[i].quantity || data.slots[i].quantity < 1) {
    //             slotErrors.slots = `Slot ${i + 1}: số lượng phải >= 1`;
    //             break;
    //         }
    //     }
    // }

    const { isValid, errors } = validateForm({
        name: {
            value: data.name,
            rules: [validators.required("tên loại combo"), validators.minLength(2), validators.maxLength(200)],
        },
        status: {
            value: data.status,
            rules: [validators.requiredSelect("trạng thái")],
        },
        image: {
            value: data.image,
            rules: [validators.required("ảnh loại combo")],
        },
    });

    // const mergedErrors = { ...errors, ...slotErrors };

    // return {
    //     isValid: isValid && Object.keys(slotErrors).length === 0, // ✅ cả 2 phải valid
    //     errors: mergedErrors,
    // };
    return {
        isValid, errors
    }
}