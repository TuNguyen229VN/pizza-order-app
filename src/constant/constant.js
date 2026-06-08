const LIST_OPTION = [
    { value: "newest", label: "Mới nhất" },
    { value: "oldest", label: "Cũ nhất" },
    { value: "asc", label: "Tên A-Z" },
    { value: "desc", label: "Tên Z-A" },
];
const STATUS_OPTIONS = [
    { value: "on", label: "Đang kinh doanh" },
    { value: "off", label: "Tạm đóng" },
];
const STATUS_OPTIONS_FILTER = [
    { value: "", label: "Tất cả" },
    { value: "on", label: "Đang kinh doanh" },
    { value: "off", label: "Tạm đóng" },
];

const USER_STATUS_OPTION = [
    { value: "", label: "Tất cả" },
    { value: "off", label: "Đang hoạt động" },
    { value: "on", label: "Bị chặn" },
];

const PAID_OPTION = [
    { value: "", label: "Tất cả" },
    { value: "true", label: "Đã thanh toán" },
    { value: "false", label: "Chưa thanh toán" },
];
const KEYWORDS = ["pizza", "melts"];
const SALT_ROUNDS = 10;
const LIMITPAGE = 4;
const API_PROFILE = "/api/profile";
const API_CATEGORIES = "/api/categories";
const API_MENU_ITEMS = "/api/menu-items";
const API_REGISTER = "/api/register";
const API_LOGIN = "/api/login";
const API_UPLOAD_IMAGE = "/api/upload";
const API_USERS = "/api/users";
const API_CHECKOUT = "/api/checkout";
const API_ORDERS = "/api/orders";
const API_CHANGE_PASSWORD = "/api/change-password";
const API_FORGOT_PASSWORD = "/api/auth/forgot-password";
const API_RESET_PASSWORD = "/api/auth/reset-password";
const API_COMBO_TYPES = "/api/combo-type";
const API_COMBO = "/api/combo";
const API_BANNERS = "/api/banners"
const API_REARRANGE="/api/rearrange"

export { PAID_OPTION, USER_STATUS_OPTION, STATUS_OPTIONS, STATUS_OPTIONS_FILTER, LIST_OPTION, KEYWORDS, SALT_ROUNDS, LIMITPAGE, API_PROFILE, API_CATEGORIES, API_MENU_ITEMS, API_REGISTER, API_LOGIN, API_UPLOAD_IMAGE, API_USERS, API_CHECKOUT, API_ORDERS, API_CHANGE_PASSWORD, API_FORGOT_PASSWORD, API_RESET_PASSWORD, API_COMBO_TYPES, API_COMBO, API_BANNERS,API_REARRANGE };

