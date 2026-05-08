import Image from "next/image";
import React from "react";


export default function EditTableImage({ link, previewLink, onFileSelect }) {

  const handleFileChange = (e) => {
    const file = e?.target.files?.[0];
    if (!file) return;
    const localPreview = URL.createObjectURL(file);
    onFileSelect(file, localPreview); // trả file + preview lên cha
  };
  const displayImage = previewLink || link;
  return (
    <label className="cursor-pointer">
      {displayImage && (
        <Image
          className="object-cover object-center w-full h-full mb-4 rounded-full"
          src={displayImage}
          width={250}
          height={250}
          alt="avatar"
        />
      )}
      {!displayImage && (
        <div className="w-full h-full mb-4 text-gray-500 bg-gray-200 rounded-full ">
          <p className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">No image</p>
        </div>
      )}
      <div className="absolute hidden -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-lg cursor-pointer group-hover:block top-1/2 left-1/2">
        <input type="file" className="hidden" onChange={handleFileChange} />
        <span className="block p-2 text-center ">
          Chỉnh sửa
        </span>
      </div>
    </label>
  );
}
