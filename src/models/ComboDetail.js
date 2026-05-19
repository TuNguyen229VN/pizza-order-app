import { model, models, Schema } from "mongoose";

// Chi tiết 1 combo cụ thể — có tên, hình ảnh, giá, và danh sách items được chọn
const ComboDetailSchema = new Schema(
    {
        name: { type: String, required: true },
        image: { type: String },
        price: { type: Number, required: true },
        comboType: { type: Schema.Types.ObjectId, ref: "ComboType", required: true },
        status: { type: String, enum: ["on", "off"], default: "on" },
        // Danh sách items được chọn vào combo
        items: [
            {
                menuItem: { type: Schema.Types.ObjectId, ref: "MenuItem", required: true },
                // Size đã chọn (bắt buộc nếu món có sizes)
                selectedSize: {
                    name: { type: String },
                    price: { type: Number },
                },
                quantity: { type: Number, default: 1 },
                // slot index tương ứng với ComboType.slots
                slotIndex: { type: Number, required: true },
            },
        ],
    },
    { timestamps: true }
);

export const ComboDetail = models?.ComboDetail || model("ComboDetail", ComboDetailSchema);