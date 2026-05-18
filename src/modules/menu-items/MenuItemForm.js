import React, { useEffect, useState } from 'react'
import EditTableImage from '../../components/layout/EditTableImage'
import MenuItemPriceProps from '../../components/layout/MenuItemPriceProps';
import { API_CATEGORIES } from '@/constant/constant';
import ValidatedInput from '../../components/input/ValidatedInput';
import ValidatedSelectInput from '../../components/input/ValidatedSelectInput';
import ButtonPrimary from '../../components/buttons/ButtonPrimary';
import Loader from '../../components/loading/Loader';
import ButtonCancel from '../../components/buttons/ButtonCancel';

export default function MenuItemForm({ onSubmit, menuItem, errors, registerRef, clearError, loadingForm }) {
    const STATUS_OPTIONS = [
        { value: "on", label: "Đang kinh doanh" },
        { value: "off", label: "Tạm đóng" },
    ];
    const [image, setImage] = useState(menuItem?.image || "");
    const [name, setName] = useState(menuItem?.name || "");
    const [description, setDescription] = useState(menuItem?.description || "");
    const [basePrice, setBasePrice] = useState(menuItem?.basePrice || "");
    const [sizes, setSizes] = useState(menuItem?.sizes || []);
    const [categories, setCategories] = useState([]);
    const [category, setCategory] = useState(menuItem?.category || categories[0]?._id || "");
    const [extraIngredientPrices, setExtraIngredientPrices] = useState(menuItem?.extraIngredientPrices || []);
    const [status, setStatus] = useState(menuItem?.status || STATUS_OPTIONS[0].value);

    const [pendingFile, setPendingFile] = useState(null);     // file chờ upload
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        if (!menuItem) return;
        setImage(menuItem.image || "");
        setName(menuItem.name || "");
        setDescription(menuItem.description || "");
        setBasePrice(menuItem.basePrice || "");
        setSizes(menuItem.sizes || []);
        setCategory(menuItem.category || "");
        setExtraIngredientPrices(menuItem.extraIngredientPrices || []);
        setStatus(menuItem.status || STATUS_OPTIONS[0].value);
    }, [menuItem]);
    
    useEffect(() => {
        fetch(`${API_CATEGORIES}?all=true`).then(res => {
            res.json().then(data => {
                const fetchedCategories = data.categories || [];

                setCategories(fetchedCategories);

                if (fetchedCategories.length === 0) {
                    setCategory("");
                    return;
                }

                // create mode
                if (!menuItem) {
                    setCategory(fetchedCategories[0]._id);
                    return;
                }

                // edit mode
                const categoryExists = fetchedCategories.some(
                    c => c._id === menuItem.category
                );

                setCategory(
                    categoryExists
                        ? menuItem.category
                        : fetchedCategories[0]._id
                );
            });
        });
    }, [menuItem]);

    function handleCancel() {
        if (loadingForm) return
        if (previewImage) URL.revokeObjectURL(previewImage);
        setPendingFile(null);
        setPreviewImage(null);
        setImage(menuItem?.image || "");
        setName(menuItem?.name || "");
        setDescription(menuItem?.description || "");
        setBasePrice(menuItem?.basePrice || "");
        setSizes(menuItem?.sizes || []);
        setCategory(menuItem?.category || "");
        setExtraIngredientPrices(menuItem?.extraIngredientPrices || []);
        setStatus(menuItem?.status || STATUS_OPTIONS[0].value);
        clearError("name");
        clearError("description");
        clearError("category");
        clearError("basePrice");
        clearError("status");
        clearError("image");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function handleFileSelect(file, localPreview) {
        setPendingFile(file);
        setPreviewImage(localPreview);
        clearError("image");
    }

    return (
        <form onSubmit={e => onSubmit(e, { image, name, description, basePrice, sizes, extraIngredientPrices, category, status }, pendingFile)} >
            <div className="rounded-lg">
                <div className="group relative p-2 rounded-lg w-[200px] h-[200px]  mx-auto">
                    <EditTableImage
                        link={image}
                        previewLink={previewImage}
                        onFileSelect={handleFileSelect}
                        loadingForm={loadingForm} />
                </div>
                {errors.image && (
                    <span className="block mx-auto mt-2 text-xs text-center text-primary w-max">{errors.image}</span>
                )}
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
                        disabled={loadingForm}
                        props={sizes}
                        setProps={setSizes}
                        fieldKey="sizes"
                        errors={errors}
                        clearError={clearError}
                        registerRef={registerRef} />
                    <MenuItemPriceProps
                        name={"Topping thêm"}
                        addLabel="Thêm topping mới"
                        disabled={loadingForm}
                        props={extraIngredientPrices} setProps={setExtraIngredientPrices}
                        fieldKey="extraIngredientPrices"
                        errors={errors}
                        clearError={clearError}
                        registerRef={registerRef} />
                    <ValidatedSelectInput
                        label="Trạng thái"
                        name="status"
                        value={status}
                        options={STATUS_OPTIONS}
                        disabled={loadingForm}
                        inputRef={registerRef("status")}
                        error={errors.status}
                        onChange={(e) => { setStatus(e.target.value); clearError("status"); }}
                    />
                    <div className='flex justify-end gap-4 mt-4'>
                        <ButtonCancel loadingForm={loadingForm} onClick={handleCancel} />
                        <button className={`flex items-center justify-center font-medium px-6 py-3 rounded-lg w-[170px] hover:opacity-80 hover:scale-[1.02] duration-500 ${loadingForm ? "bg-[#DFE4EA] text-secondary pointer-events-none" : "bg-primary text-white pointer-events-auto"}`} type="submit" disabled={loadingForm}>{loadingForm ? <Loader size={20} /> : <span className='font-medium'>Cập nhật</span>}</button>
                    </div>
                </div>
            </div>
        </form>
    )
}
