const { Schema, model, models } = require("mongoose");

const UserInfoSchema = new Schema({
    email: { type: String, required: true },
    phone: { type: String },
    streetAddress: { type: String },
    city: { type: String },
    country: { type: String },
    gender: { type: String },
    birthday: { type: String },
    admin: { type: Boolean, default: false },
    status: { type: String, enum: ["on", "off"], default: "off" }
}, { timestamps: true })
export const UserInfo = models?.UserInfo || model("UserInfo", UserInfoSchema)

