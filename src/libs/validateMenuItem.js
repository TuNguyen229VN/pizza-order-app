import { validateForm, validators } from "./validators";

export function validateMenuItem(data) {
    const dynamicFields = {};

    data.sizes?.forEach((item, i) => {
        dynamicFields[`sizes_${i}_name`] = {
            value: item.name,
            rules: [validators.required("tên size")],
        };
        dynamicFields[`sizes_${i}_price`] = {
            value: item.price,
            rules: [validators.required("giá"), validators.isNumber("Giá"), validators.minValue(1000), validators.maxValue(100000000)],
        };
    });

    data.extraIngredientPrices?.forEach((item, i) => {
        dynamicFields[`extraIngredientPrices_${i}_name`] = {
            value: item.name,
            rules: [validators.required("tên topping")],
        };
        dynamicFields[`extraIngredientPrices_${i}_price`] = {
            value: item.price,
            rules: [validators.required("giá"), validators.isNumber("Giá"), validators.minValue(1000), validators.maxValue(100000000)],
        };
    });

    return validateForm({
        name: {
            value: data.name,
            rules: [validators.required("tên món ăn"), validators.minLength(2), validators.maxLength(200)],
        },
        description: {
            value: data.description,
            rules: [validators.required("mô tả"), validators.minLength(2), validators.maxLength(200)],
        },
        basePrice: {
            value: data.basePrice,
            rules: [validators.required("giá cơ bản"), validators.isNumber("giá cơ bản"), validators.minValue(1000), validators.maxValue(100000000)],
        },
        category: {
            value: data.category,
            rules: [validators.requiredSelect("danh mục")],
        },
        status: {
            value: data.status,
            rules: [validators.requiredSelect("trạng thái")],
        },
        image: {
            value: data.image,
            rules: [validators.required("ảnh món ăn")],
        },
        ...dynamicFields,
    });
}