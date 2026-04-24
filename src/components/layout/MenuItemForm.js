import React, { useState } from 'react'
import EditTableImage from './EditTableImage'
import MenuItemPriceProps from './MenuItemPriceProps';

export default function MenuItemForm({ onSubmit, menuItem }) {
    const [image, setImage] = useState(menuItem?.image || "");
    const [name, setName] = useState(menuItem?.name || "");
    const [description, setDescription] = useState(menuItem?.description || "");
    const [basePrice, setBasePrice] = useState(menuItem?.basePrice || "");
    const [sizes, setSizes] = useState(menuItem?.sizes || []);
    const [extraIngredientPrices, setExtraIngredientPrices] = useState(menuItem?.extraIngredientPrices || []);
    return (
        <form onSubmit={e => onSubmit(e, { image, name, description, basePrice, sizes, extraIngredientPrices })} className="max-w-md mx-auto mt-8">
            <div
                className="grid items-start gap-4"
                style={{ gridTemplateColumns: ".3fr .7fr" }}
            >
                <div>
                    <EditTableImage link={image} setLink={setImage} />
                </div>
                <div className="grow">
                    <label htmlFor="">Item name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <label htmlFor="">Description</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <label htmlFor="">Base price</label>
                    <input
                        type="text"
                        value={basePrice}
                        onChange={(e) => setBasePrice(e.target.value)}
                    />
                    <MenuItemPriceProps name={"Sizes"} addLabel="Add item size" props={sizes} setProps={setSizes} />
                    <MenuItemPriceProps name={"Extra ingredients"} addLabel="Add ingredient prices" props={extraIngredientPrices} setProps={setExtraIngredientPrices} />
                    <button type="submit">Save</button>
                </div>
            </div>
        </form>
    )
}
