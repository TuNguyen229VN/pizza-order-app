const { Schema, models, model } = require("mongoose");

const BannerSchema = new Schema(
  {
    name: { type: String, required: true },
    status: { type: String, enum: ["on", "off"], default: "on" },
    image: { type: String },
  },
  { timestamps: true }
);

export const Banner = models?.Banner || model("Banner", BannerSchema);

