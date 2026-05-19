import { model, models, Schema } from "mongoose";

// Loại combo (VD: "Combo 1 người", "Combo gia đình")
const ComboTypeSchema = new Schema(
    {
        image: { type: String },
        name: { type: String, required: true },
        status: { type: String, enum: ["on", "off"], default: "on" },
        // Các slot trong combo: mỗi slot định nghĩa 1 category và số lượng item cần chọn
        slots: [
            {
                category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
                quantity: { type: Number, required: true, default: 1 }, // số lượng món từ category này
                label: { type: String }, // VD: "Pizza", "Đồ uống"
            },
        ],
    },
    { timestamps: true }
);

export const ComboType = models?.ComboType || model("ComboType", ComboTypeSchema);