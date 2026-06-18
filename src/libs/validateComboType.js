import { createValidators, validateForm } from "./validators";

export function validateComboType(data, t) {

    const validators = createValidators(t);
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

    return {
        isValid, errors
    }
}