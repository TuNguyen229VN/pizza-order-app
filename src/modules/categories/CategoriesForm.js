import ButtonCancel from '@/components/buttons/ButtonCancel';
import ButtonPrimary from '@/components/buttons/ButtonPrimary';
import ValidatedInput from '@/components/input/ValidatedInput';
import ValidatedSelectInput from '@/components/input/ValidatedSelectInput';
import Loader from '@/components/loading/Loader';
import React from 'react'

export default function CategoriesForm({ editedCategory, categoryName, setCategoryName, status, setStatus, errors, loadingForm, handleCategorySubmit, clearError, previewImage, setPreviewImage, pendingFile, setPendingFile, setEditedCategory,registerRef,STATUS_OPTIONS,setImageInputKey }) {
    return (
        <form className="" onSubmit={handleCategorySubmit}>
            <div className="">
                <ValidatedInput
                    label={editedCategory ? <span>Cập nhật danh mục <span className="font-semibold">{editedCategory.name}</span></span> : "Tên danh mục mới"}
                    name="categoryName"
                    value={categoryName || ""}
                    inputRef={registerRef("categoryName")}
                    error={errors.categoryName}
                    placeholder="Nhập tên danh mục "
                    disabled={loadingForm}
                    onChange={(e) => { setCategoryName(e.target.value); clearError("categoryName"); }}
                />
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
            </div>
            <div className="flex items-center justify-end gap-2 pb-2 mt-4">
                <ButtonCancel
                    loadingForm={loadingForm}
                    onClick={() => {
                        setCategoryName("");
                        clearError("categoryName");
                        setStatus(STATUS_OPTIONS[0].value);
                        setPreviewImage(null);
                        setPendingFile(null);
                        setEditedCategory(null);
                        setImageInputKey((k) => k + 1);
                    }} />
                <ButtonPrimary disabled={loadingForm} className={"!w-[170px]"} type="submit">{loadingForm ? <Loader size={20} /> : (editedCategory ? "Cập nhật" : "Tạo mới")}</ButtonPrimary>
            </div>
        </form>
    )
}
