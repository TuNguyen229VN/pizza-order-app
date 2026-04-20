import { API_UPLOAD_IMAGE } from "@/constant/constant";
import Image from "next/image";
import React from "react";
import toast from "react-hot-toast";

export default function EditTableImage({ link, setLink }) {
  const handleFileChange = async (e) => {
    const files = e?.target.files;
    if (files?.length === 1) {
      const data = new FormData();
      data.set("file", files[0]);
      const uploadPromise = new Promise(async (resolve, reject) => {
        const response = await fetch(API_UPLOAD_IMAGE, {
          method: "POST",
          // headers: { "Content-Type": "multipart/form-data" },
          body: data,
        });
        if (response.ok) {
          const link = await response.json();
          setLink(link?.url);
          resolve();
        } else {
          reject();
        }
      });
      toast.promise(uploadPromise, {
        loading: "Uploading...",
        success: "Upload completed",
        error: "Upload error",
      });
    }
  };
  return (
    <>
      {link && (
        <Image
          className="object-cover w-full h-full mb-4 rounded-lg"
          src={link}
          width={250}
          height={250}
          alt="avatar"
        />
      )}
      {!link && (
        <div className="p-4 mb-1 text-center text-gray-500 bg-gray-200 rounded-lg">
            No image
        </div>
      )}
      <label>
        <input type="file" className="hidden" onChange={handleFileChange} />
        <span className="block p-2 text-center border border-gray-300 rounded-lg cursor-pointer">
          Edit
        </span>
      </label>
    </>
  );
}
