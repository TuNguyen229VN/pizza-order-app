import Image from "next/image";
import React from "react";


export default function EditTableImage({ link, previewLink, onFileSelect, loadingForm,classNameImage }) {

  const handleFileChange = (e) => {
    const file = e?.target.files?.[0];
    if (!file) return;
    const localPreview = URL.createObjectURL(file);
    onFileSelect(file, localPreview); // trả file + preview lên cha
  };
  const displayImage = previewLink || link;
  return (
    <label className={`${loadingForm ? "pointer-events-none" : "cursor-pointer pointer-events-auto "}`}>
      {displayImage && (
        <Image
          className={`object-cover object-center w-full h-full mb-4 rounded-full ${classNameImage}`}
          src={displayImage}
          width={1200}
          height={250}
          quality={100}
          alt="avatar"
        />
      )}
      {!displayImage && (
        <div className={`w-full h-full mb-4 text-gray-500 bg-gray-200 rounded-full  ${classNameImage}`}>
          <p className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">No image</p>
        </div>
      )}
      <div className={`absolute hidden -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-lg cursor-pointer  top-1/2 left-1/2 ${loadingForm ? "" : "group-hover:block"}`}>
        <input type="file" className="hidden" onChange={handleFileChange} disabled={loadingForm} />
        <span className="block p-2 text-center ">
          Chỉnh sửa
        </span>
      </div>
    </label>
  );
}
