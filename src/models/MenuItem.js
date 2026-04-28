import { model, models, Schema } from "mongoose";

const ExtraPriceSchema = new Schema({
    name: String,
    price: Number,
});
const MenuItemSchema = new Schema(
    {
        image: { type: String },
        name: { type: String },
        description: { type: String },
        category:{ type: Schema.Types.ObjectId, ref: "Category" },
        basePrice: { type: Number },
        sizes: { type: [ExtraPriceSchema] }, 
        extraIngredientPrices: { type: [ExtraPriceSchema] },
    },
    { timestamps: true },
);

export const MenuItem = models?.MenuItem || model("MenuItem", MenuItemSchema);
