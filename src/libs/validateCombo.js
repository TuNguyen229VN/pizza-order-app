import { validateForm, validators } from "./validators";

export function validateCombo(data) {
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

    const slotErrors = {};
    if (!data.slots || data.slots.length === 0) {
        slotErrors.slots = "Phải có ít nhất 1 slot";
    } else {
        for (let i = 0; i < data.slots.length; i++) {
            if (!data.slots[i].category) {
                slotErrors.slots = `Slot ${i + 1}: chưa chọn danh mục`;
                break;
            }
            if (!data.slots[i].quantity || data.slots[i].quantity < 1) {
                slotErrors.slots = `Slot ${i + 1}: số lượng phải >= 1`;
                break;
            }
        }
    }

    const mergedErrors = { ...errors, ...slotErrors };

    return {
        isValid: isValid && Object.keys(slotErrors).length === 0, // ✅ cả 2 phải valid
        errors: mergedErrors,
    };

    // Validate selections
    // const selectionErrors = {};
    // if (!Array.isArray(data.items) || data.items.length === 0) {
    //     selectionErrors.selections = "Vui lòng chọn đủ món cho tất cả các slot";
    // } else {
    //     for (const item of data.items) {
    //         if (!item.menuItem) {
    //             selectionErrors.selections = "Vui lòng chọn đủ món cho tất cả các slot";
    //             break;
    //         }
    //         if (item.slotIndex === undefined || item.slotIndex === null) {
    //             selectionErrors.selections = "Thiếu slotIndex";
    //             break;
    //         }
    //     }
    // }

    // const mergedErrors = { ...errors, ...selectionErrors };
    // return {
    //     isValid: isValid && Object.keys(selectionErrors).length === 0,
    //     errors: mergedErrors,
    // };

}