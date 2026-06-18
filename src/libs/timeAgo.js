export function timeAgo(dateStr, t) {
    const date = new Date(dateStr);
    const diff = Math.floor((Date.now() - date) / 1000);
    if (diff < 60) return `${diff} ${t("giây trước")}`;
    if (diff < 3600) return `${Math.floor(diff / 60)} ${t("phút trước")}`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ${t("giờ trước")}`;
    if (diff < 7 * 86400) return `${Math.floor(diff / 86400)} ${t("ngày trước")}`;
    return date.toLocaleDateString("vi-VN", {
        hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric"
    });
}