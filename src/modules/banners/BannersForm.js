import ButtonCancel from '@/components/buttons/ButtonCancel';
import ButtonPrimary from '@/components/buttons/ButtonPrimary';
import ValidatedInput from '@/components/input/ValidatedInput';
import ValidatedSelectInput from '@/components/input/ValidatedSelectInput';
import Loader from '@/components/loading/Loader';
import React from 'react'

export default function BannersForm({ categories, editedBanner, bannerName, setBannerName, status, setStatus, errors, loadingForm, handleBannerSubmit, clearError, setPreviewImage, setPendingFile, setEditedBanner, registerRef, STATUS_OPTIONS,setImageInputKey }) {
    return (
        <form className="" onSubmit={handleBannerSubmit}>
            <div className="">
                <ValidatedSelectInput
                    label={editedBanner ? <span>Cập nhật banner <span className="font-semibold">{editedBanner.name}</span></span> : "Tên banner mới"}
                    name="bannerName"
                    value={bannerName || ""}
                    inputRef={registerRef("bannerName")}
                    error={errors.bannerName}
                    options={[
                        { value: "", label: "-- Chọn slug để trỏ vào --" },
                        ...categories.map((c) => ({ value: c.name, label: c.name })),
                    ]}
                    placeholder="Nhập tên banner "
                    disabled={loadingForm}
                    onChange={(e) => { setBannerName(e.target.value); clearError("bannerName"); }}
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
                        setBannerName("");
                        clearError("bannerName");
                        setStatus(STATUS_OPTIONS[0].value);
                        setPreviewImage(null);
                        setPendingFile(null);
                        setEditedBanner(null);
                        setImageInputKey((k) => k + 1);
                    }} />
                <ButtonPrimary disabled={loadingForm} className={"!w-[170px]"} type="submit">{loadingForm ? <Loader size={20} /> : (editedBanner ? "Cập nhật" : "Tạo mới")}</ButtonPrimary>
            </div>
        </form>
    )
}
