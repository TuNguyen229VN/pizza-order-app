import { model, models, Schema } from "mongoose";

// Loại combo (VD: "Combo 1 người", "Combo gia đình")
const ComboTypeSchema = new Schema(
    {
        image: { type: String },
        name: { type: String, required: true },
        status: { type: String, enum: ["on", "off"], default: "on" },
        order: { type: Number, default: 0 }
    },
    { timestamps: true }
);

export const ComboType = models?.ComboType || model("ComboType", ComboTypeSchema);