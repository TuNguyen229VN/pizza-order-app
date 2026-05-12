const { Schema, models, model } = require("mongoose");

const CategorySchema = new Schema(
  {
    name: { type: String, required: true },
    status: { type: String, enum: ["on", "off"], default: "on" },
    image: { type: String },
  },
  { timestamps: true }
);

export const Category = models?.Category || model("Category", CategorySchema);

