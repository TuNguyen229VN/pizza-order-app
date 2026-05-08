"use client"
import React, { useState } from 'react'
import EditTableImage from './EditTableImage';
import UseProfile from '../UseProfile';
import AddressInput from './AddressInput';
import ValidatedInput from '../input/ValidatedInput';
import ValidatedSelectInput from '../input/ValidatedSelectInput';
import ValidatedDateInput from '../input/ValidatedDateInput';
import Loader from '../loading/Loader';

export default function UserForm({ title, user, onSave, errors, registerRef, clearError, loadingForm }) {
  const [userName, setUserName] = useState(user?.name || "");
  const [image, setImage] = useState(user?.image || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [streetAddress, setStreetAddress] = useState(user?.streetAddress || "");
  const [postalCode, setPostalCode] = useState(user?.postalCode || "");
  const [city, setCity] = useState(user?.city || "");
  const [country, setCountry] = useState(user?.country || "");
  const [admin, setAdmin] = useState(user?.admin || false);

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

  function handleAddressChange(propName, value) {
    if (propName === 'phone') setPhone(value);
    if (propName === 'streetAddress') setStreetAddress(value);
    if (propName === 'postalCode') setPostalCode(value);
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
    setStreetAddress(user?.streetAddress || "");
    setPostalCode(user?.postalCode || "");
    setCity(user?.city || "");
    setCountry(user?.country || "");
    setAdmin(user?.admin || false);
    setBirthday(user?.birthday
      ? new Date(user.birthday).toISOString().split("T")[0]
      : "");
    setGender(user?.gender || GENDER_OPTIONS[0].value);
    clearError("userName");
    clearError("gender");
    clearError("birthday");
    clearError("phone");
    clearError("streetAddress");
    clearError("country");
    clearError("city");
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    onSave(ev, {
      name: userName,
      image,           // ảnh cũ, để ProfilePage tự xử lý
      phone, admin, streetAddress, postalCode, city, country, gender, birthday
    }, pendingFile);
  }

  return (
    <div className="px-4 py-4 border rounded-2xl">
      <p className='text-[28px] leading-10 font-semibold text-blackHeader capitalize'>{title}</p>
      <div className="rounded-lg">
        <div className="group relative p-2 rounded-lg w-[200px] h-[200px]  mx-auto">
          <EditTableImage
            link={image}
            previewLink={previewImage}
            onFileSelect={handleFileSelect} />
        </div>
      </div>
      <form id='user-form' className="grow" onSubmit={handleSubmit}>
        <ValidatedInput
          label="Tên"
          name="userName"
          value={userName || ""}
          inputRef={registerRef("userName")}
          error={errors.userName}
          placeholder="Nhập tên của bạn"
          onChange={(e) => {
            setUserName(e.target.value);
            clearError("userName");
          }}
        />
        <ValidatedSelectInput
          label="Giới tính"
          name="gender"
          value={gender}
          options={GENDER_OPTIONS}
          inputRef={registerRef("gender")}
          error={errors.gender}
          onChange={(e) => { setGender(e.target.value); clearError("gender"); }}
        />
        <ValidatedDateInput
          label="Ngày sinh"
          name="birthday"
          value={birthday}
          inputRef={registerRef("birthday")}
          error={errors.birthday}
          onChange={(e) => { setBirthday(e.target.value); clearError("birthday"); }}
        />
        <AddressInput
          infoProps={{ phone, streetAddress, postalCode, city, country }}
          setInfoProps={handleAddressChange}
          errors={errors} registerRef={registerRef}
          clearError={clearError}
        />

        <ValidatedInput
          label="Email"
          name="email"
          value={user?.email}
          placeholder="Nhập email của bạn"
          disabled
        />
        {loggedInUserData?.admin && loggedInUserData?.email !== user?.email && (
          <div>
            <label htmlFor="adminCB" className='inline-flex items-center p-1 mb-2 '>
              <input type="checkbox" id='adminCB' className='mr-2' value={"1"}
                checked={admin} onClick={ev => setAdmin(ev.target.checked)}
              />
              <span>Admin</span>
            </label>
          </div>
        )}
      </form>
      <div className='flex justify-end gap-4 mt-4'>
        <button className='font-medium px-6 py-3 outline-none border rounded-lg w-[170px] hover:opacity-80 hover:scale-[1.02]  duration-500 hover:bg-red-100 hover:text-secondary' onClick={handleCancel} disabled={loadingForm}>Hủy</button>
        <button form='user-form' className='flex items-center justify-center font-medium px-6 py-3 text-white rounded-lg bg-primary w-[170px] hover:opacity-80 hover:scale-[1.02] duration-500' type="submit" disabled={loadingForm}>{loadingForm ? <Loader size={20} /> : <span className='font-medium'>Lưu</span>}</button>
      </div>
    </div>
  )
}
