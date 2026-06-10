import { model, models, Schema } from "mongoose";

// Chi tiết 1 combo cụ thể — có tên, hình ảnh, giá, và danh sách items được chọn
const ComboDetailSchema = new Schema(
    {
        name: { type: String, required: true },
        image: { type: String },
        price: { type: Number, required: true },
        comboType: { type: Schema.Types.ObjectId, ref: "ComboType", required: true },
        status: { type: String, enum: ["on", "off"], default: "on" },
        slots: [
            {
                category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
                quantity: { type: Number, required: true, default: 1 }, // số lượng món từ category này
                label: { type: String }, // VD: "Pizza", "Đồ uống"
                size: {          
                    name: { type: String },
                    price: { type: Number },
                },
                allowedItems: [{ type: Schema.Types.ObjectId, ref: "MenuItem" }],
            },
        ],
        order: { type: Number, default: 0 }
    },
    { timestamps: true }
);

export const ComboDetail = models?.ComboDetail || model("ComboDetail", ComboDetailSchema);