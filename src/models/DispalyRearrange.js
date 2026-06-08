import { model, models, Schema } from "mongoose";

const DispalyRearrangeSchema = new Schema({
    // Lưu thứ tự sections trên trang home (category + comboType trộn lẫn)
    sections: [
        {
            refId: { type: Schema.Types.ObjectId, required: true },
            refType: { type: String, enum: ["category", "comboType"], required: true },
            order: { type: Number, required: true },
        }
    ]
}, { timestamps: true });

export const DispalyRearrange = models?.DispalyRearrange || model("DispalyRearrange", DispalyRearrangeSchema);