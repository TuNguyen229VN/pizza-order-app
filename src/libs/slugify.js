export function slugify(text) {
    return text
        .normalize("NFD") // tách dấu khỏi ký tự
        .replace(/[\u0300-\u036f]/g, "") // xóa dấu
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase() // chữ thường
        .trim() // xóa khoảng trắng đầu cuối
        .replace(/\s+/g, "-") // khoảng trắng -> -
        .replace(/[^\w-]+/g, "") // xóa ký tự đặc biệt
        .replace(/--+/g, "-"); // xóa nhiều dấu - liên tiếp
}