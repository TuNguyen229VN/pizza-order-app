"use client"
import React, { useEffect, useState } from 'react'
import EditTableImage from '../../components/layout/EditTableImage';
import UseProfile from '../../components/UseProfile';
import AddressInput from '../../components/layout/AddressInput';
import ValidatedInput from '../../components/input/ValidatedInput';
import ValidatedSelectInput from '../../components/input/ValidatedSelectInput';
import ValidatedDateInput from '../../components/input/ValidatedDateInput';
import Loader from '../../components/loading/Loader';
import ContainerProfileLeft from '@/container/ContainerProfileLeft';
import ButtonCancel from '../../components/buttons/ButtonCancel';
import { useTranslations } from 'next-intl';

export default function UserForm({ title, user, onSave, errors, registerRef, clearError, loadingForm }) {
  const STATUS_OPTIONS = [
    { value: "off", label: "Đang hoạt động" },
    { value: "on", label: "Bị chặn" },
  ];
    const sTrans = useTranslations("System");
  const [status, setStatus] = useState(user?.status || STATUS_OPTIONS[0].value);
  const [userName, setUserName] = useState(user?.name || "");
  const [image, setImage] = useState(user?.image || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [city, setCity] = useState(user?.city || "");
  const [country, setCountry] = useState(user?.country || "");
  const [admin, setAdmin] = useState(user?.admin || false);
  const [imageInputKey, setImageInputKey] = useState(0);
  const GENDER_OPTIONS = [
    { value: "male", label: "Nam" },
    { value: "female", label: "Nữ" },
    { value: "other", label: "Khác" },
  ];
  const [gender, setGender] = useState(user?.gender || GENDER_OPTIONS[0].value);
  const [birthday, setBirthday] = useState(user?.birthday
    ? new Date(user.birthday).toISOString().split("T")[0]
    : "");

  const [pendingFile, setPendingFile] = useState(null);     // file chờ upload
  const [previewImage, setPreviewImage] = useState(null);

  const { data: loggedInUserData } = UseProfile();

  useEffect(() => {
    if (!user) return;
    setUserName(user.name || "");
    setImage(user.image || "");
    setPhone(user.phone || "");
    setCity(user.city || "");
    setCountry(user.country || "");
    setAdmin(user.admin || false);
    setGender(user.gender || GENDER_OPTIONS[0].value);
    setBirthday(user.birthday
      ? new Date(user.birthday).toISOString().split("T")[0]
      : ""
    );
  }, [user]);


  function handleAddressChange(propName, value) {
    if (propName === 'phone') setPhone(value);
    if (propName === 'city') setCity(value);
    if (propName === 'country') setCountry(value);
  }

  function handleFileSelect(file, localPreview) {
    setPendingFile(file);
    setPreviewImage(localPreview);
  }

  // Reset toàn bộ form về giá trị gốc
  function handleCancel() {
    if (loadingForm) return
    if (previewImage) URL.revokeObjectURL(previewImage);
    setPendingFile(null);
    setPreviewImage(null);
    setImage(user?.image || "");
    setUserName(user?.name || "");
    setPhone(user?.phone || "");
    setCity(user?.city || "");
    setCountry(user?.country || "");
    setAdmin(user?.admin || false);
    setBirthday(user?.birthday
      ? new Date(user.birthday).toISOString().split("T")[0]
      : "");
    setGender(user?.gender || GENDER_OPTIONS[0].value);
    setImageInputKey((k) => k + 1);
    clearError("userName");
    clearError("gender");
    clearError("birthday");
    clearError("phone")
    clearError("country");
    clearError("city");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    onSave(ev, {
      name: userName,
      image,           // ảnh cũ, để ProfilePage tự xử lý
      phone, admin, city, country, gender, birthday
    }, pendingFile);
  }

  return (
    <ContainerProfileLeft title={title}>
      <div className="rounded-lg">
        <div className="group relative p-2 rounded-lg w-[200px] h-[200px]  mx-auto">
          <EditTableImage
            key={imageInputKey}
            link={image}
            previewLink={previewImage}
            onFileSelect={handleFileSelect}
            loadingForm={loadingForm} />
        </div>
      </div>
      <form id='user-form' className="grow" onSubmit={handleSubmit}>
        <ValidatedInput
          label={sTrans("Tên")}
          name="userName"
          value={userName || ""}
          inputRef={registerRef("userName")}
          error={errors.userName}
          disabled={loadingForm}
          placeholder={sTrans("Nhập tên của bạn")}
          onChange={(e) => {
            setUserName(e.target.value);
            clearError("userName");
          }}
        />
        <ValidatedSelectInput
          label={sTrans("Giới tính")}
          name="gender"
          value={gender}
          options={GENDER_OPTIONS}
          disabled={loadingForm}
          inputRef={registerRef("gender")}
          error={errors.gender}
          onChange={(e) => { setGender(e.target.value); clearError("gender"); }}
        />
        <ValidatedDateInput
          label={sTrans("Ngày sinh")}
          name="birthday"
          value={birthday}
          inputRef={registerRef("birthday")}
          error={errors.birthday}
          disabled={loadingForm}
          onChange={(e) => { setBirthday(e.target.value); clearError("birthday"); }}
        />
        <ValidatedInput
          label={sTrans("Số điện thoại")}
          name="phone"
          value={phone || ""}
          inputRef={registerRef("phone")}
          error={errors.phone}
          placeholder={sTrans("Nhập số điện thoại của bạn")}
          disabled={loadingForm}
          onChange={(e) => {
            setPhone(e.target.value);
            clearError("phone");
          }}
        />

        <ValidatedInput
          important={false}
          label={sTrans("Email")}
          name="email"
          value={user?.email}
          placeholder={sTrans("Nhập email của bạn")}
          disabled
        />
        {loggedInUserData?.admin && loggedInUserData?.email !== user?.email && (
          <div>
            <label htmlFor="adminCB" className='inline-flex items-center p-1 mt-2 mb-2'>
              <input type="checkbox" id='adminCB' className='mr-2' value={"1"}
                checked={admin} onClick={ev => setAdmin(ev.target.checked)}
              />
              <span>Admin</span>
            </label>
          </div>
        )}
      </form>
      <div className='flex justify-end gap-4 mt-4'>
        <ButtonCancel loadingForm={loadingForm} onClick={handleCancel} />
        <button form='user-form' className={`flex items-center justify-center font-medium px-6 py-3 rounded-lg w-[170px] hover:opacity-80 hover:scale-[1.02] duration-500 ${loadingForm ? "bg-[#DFE4EA] text-secondary pointer-events-none" : "bg-primary text-white pointer-events-auto"}`} type="submit" disabled={loadingForm}>{loadingForm ? <Loader size={20} /> : <span className='font-medium'>{sTrans("Cập nhật")}</span>}</button>
      </div>
    </ContainerProfileLeft>
  )
}
