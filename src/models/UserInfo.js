const { Schema, model, models } = require("mongoose");

const UserInfoSchema = new Schema({
    email: { type: String, required: true },
    phone: { type: String },
    gender: { type: String },
    birthday: { type: String },
    admin: { type: Boolean, default: false },
    status: { type: String, enum: ["on", "off"], default: "off" },
    pointRewards: { type: Number, default: 0 },
}, { timestamps: true })
export const UserInfo = models?.UserInfo || model("UserInfo", UserInfoSchema)

