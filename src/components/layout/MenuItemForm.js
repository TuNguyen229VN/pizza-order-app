import React, { useEffect, useState } from 'react'
import EditTableImage from './EditTableImage'
import MenuItemPriceProps from './MenuItemPriceProps';
import { API_CATEGORIES } from '@/constant/constant';
import ValidatedInput from '../input/ValidatedInput';
import ValidatedSelectInput from '../input/ValidatedSelectInput';
import ButtonPrimary from '../buttons/ButtonPrimary';
import Loader from '../loading/Loader';
import ButtonCancel from '../buttons/ButtonCancel';

export default function MenuItemForm({ onSubmit, menuItem, errors, registerRef, clearError, loadingForm }) {
    const [image, setImage] = useState(menuItem?.image || "");
    const [name, setName] = useState(menuItem?.name || "");
    const [description, setDescription] = useState(menuItem?.description || "");
    const [basePrice, setBasePrice] = useState(menuItem?.basePrice || "");
    const [sizes, setSizes] = useState(menuItem?.sizes || []);
    const [category, setCategory] = useState(menuItem?.category || "");
    const [categories, setCategories] = useState([]);
    const [extraIngredientPrices, setExtraIngredientPrices] = useState(menuItem?.extraIngredientPrices || []);

    useEffect(() => {
        if (!menuItem) return;
        setImage(menuItem.image || "");
        setName(menuItem.name || "");
        setDescription(menuItem.description || "");
        setBasePrice(menuItem.basePrice || "");
        setSizes(menuItem.sizes || []);
        setCategory(menuItem.category || "");
        setExtraIngredientPrices(menuItem.extraIngredientPrices || []);

    }, [menuItem]);

    useEffect(() => {
        fetch(`${API_CATEGORIES}?all=true`).then(res => {
            res.json().then(data => {
                setCategories(data.categories);
            })
        })
    }, [menuItem])

    function handleCancel() {
        if (loadingForm) return
        // if (previewImage) URL.revokeObjectURL(previewImage);
        // setPendingFile(null);
        // setPreviewImage(null);
        setImage(menuItem.image || "");
        setName(menuItem.name || "");
        setDescription(menuItem.description || "");
        setBasePrice(menuItem.basePrice || "");
        setSizes(menuItem.sizes || []);
        setCategory(menuItem.category || "");
        setExtraIngredientPrices(menuItem.extraIngredientPrices || []);

        clearError("name");
        clearError("description");
        clearError("category");
        clearError("basePrice");
    }

    return (
        <form onSubmit={e => onSubmit(e, { image, name, description, basePrice, sizes, extraIngredientPrices, category })} >
            <div className="rounded-lg">
                <div className="group relative p-2 rounded-lg w-[200px] h-[200px]  mx-auto">
                    <EditTableImage link={image} setLink={setImage} />
                </div>
                <div className="">
                    <ValidatedInput
                        label="Tên món ăn"
                        name="name"
                        value={name || ""}
                        inputRef={registerRef("name")}
                        error={errors.name}
                        disabled={loadingForm}
                        placeholder="Nhập tên món ăn"
                        onChange={(e) => {
                            setName(e.target.value);
                            clearError("name");
                        }}
                    />

                    <ValidatedInput
                        label="Mô tả món ăn"
                        name="description"
                        value={description || ""}
                        inputRef={registerRef("description")}
                        error={errors.description}
                        disabled={loadingForm}
                        placeholder="Nhập mô tả món ăn"
                        onChange={(e) => {
                            setDescription(e.target.value);
                            clearError("description");
                        }}
                    />

                    <ValidatedSelectInput
                        label="Danh mục"
                        name="category"
                        value={category}
                        options={categories.map(c => ({ value: c._id, label: c.name }))}
                        disabled={loadingForm}
                        inputRef={registerRef("category")}
                        error={errors.category}
                        onChange={(e) => { setCategory(e.target.value); clearError("category"); }}
                    />

                    <ValidatedInput
                        label="Giá món ăn cơ bản"
                        name="basePrice"
                        value={basePrice || ""}
                        inputRef={registerRef("basePrice")}
                        error={errors.basePrice}
                        disabled={loadingForm}
                        placeholder="Nhập giá món ăn cơ bản"
                        onChange={(e) => {
                            setBasePrice(e.target.value);
                            clearError("basePrice");
                        }}
                    />
                    <MenuItemPriceProps name={"Kích thước"}
                        addLabel="Thêm kích thước mới"
                        props={sizes}
                        setProps={setSizes}
                        fieldKey="sizes"
                        errors={errors}
                        clearError={clearError}
                        registerRef={registerRef} />
                    <MenuItemPriceProps
                        name={"Topping thêm"}
                        addLabel="Thêm topping mới"
                        props={extraIngredientPrices} setProps={setExtraIngredientPrices}
                        fieldKey="extraIngredientPrices"
                        errors={errors}
                        clearError={clearError}
                        registerRef={registerRef} />
                    <div className='flex justify-end gap-4 mt-4'>
                        <ButtonCancel loadingForm={loadingForm} onClick={handleCancel} />
                        <button  className={`flex items-center justify-center font-medium px-6 py-3 rounded-lg w-[170px] hover:opacity-80 hover:scale-[1.02] duration-500 ${loadingForm ? "bg-[#DFE4EA] text-secondary pointer-events-none" : "bg-primary text-white pointer-events-auto"}`} type="submit" disabled={loadingForm}>{loadingForm ? <Loader size={20} /> : <span className='font-medium'>Cập nhật</span>}</button>
                    </div>
                </div>
            </div>
        </form>
    )
}
