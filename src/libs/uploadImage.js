import { API_UPLOAD_IMAGE } from "@/constant/constant";

export async function uploadImage(file) {
    const formData = new FormData();
    formData.set("file", file);

    const res = await fetch(API_UPLOAD_IMAGE, {
        method: "POST",
        body: formData,
    });

    if (!res.ok) {
        throw new Error("Upload ảnh thất bại");
    }

    const data = await res.json();
    return data?.url;
}