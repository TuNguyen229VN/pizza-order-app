const LIST_OPTION = [
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "asc", label: "AtoZ" },
  { value: "desc", label: "ZtoA" },
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
const PRESET_TAGS = [
  { label: "✨ New", value: "New", color: "bg-red-50 text-red-800 border-red-200" },
  { label: "🌶️ Cay", value: "Cay", color: "bg-red-100 text-red-900 border-red-200" },
  { label: "🌿 Chay", value: "Chay", color: "bg-green-50 text-green-800 border-green-200" },
  { label: "⭐ Best Seller", value: "Best Seller", color: "bg-amber-50 text-amber-800 border-amber-200" },
];

const METHODS = [
  {
    value: "cod",
    label: "COD_LABEL",
    sub: "COD_SUB",
    icon: "/images/cod.png",
    iconBg: "bg-gray-100",
  },
  {
    value: "stripe",
    label: "STRIPE_LABEL",
    sub: "STRIPE_SUB",
    icon: "/images/stripe.png",
    iconBg: "bg-purple-100",
  },
  {
    value: "momo",
    label: "MOMO_LABEL",
    sub: "MOMO_SUB",
    icon: "/images/momo.png",
    iconBg: "bg-pink-100",
  },
  {
    value: "zalopay",
    label: "ZALO_LABEL",
    sub: "ZALO_SUB",
    icon: "/images/zalopay.png",
    iconBg: "bg-blue-100",
  },
  {
    value: "paypal",
    label: "PAYPAL_LABEL",
    sub: "PAYPAL_SUB",
    icon: "/images/paypal.png",
    iconBg: "bg-indigo-100",
  },

];
const MIN_DELIVERY_AMOUNT = 80000;
const DIVISION_POINT = 10000;
const EXCHANGE_RATE_VIETNAM = 25000;
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
const API_BANNERS = "/api/banners";
const API_REARRANGE = "/api/rearrange";
const API_NOTIFICATION = "/api/notifications";
const API_PUSHER_AUTH = "/api/pusher/auth";
const POINT_TIERS = [
  { minPoints: 1000, discountPercent: 20, label: "Thành viên Vàng" },
  { minPoints: 500, discountPercent: 10, label: "Thành viên Bạc" },
  { minPoints: 200, discountPercent: 5, label: "Thành viên Đồng" },
  { minPoints: 50, discountPercent: 2, label: "Thành viên thân thiết" },
];
export { PAID_OPTION, USER_STATUS_OPTION, STATUS_OPTIONS, STATUS_OPTIONS_FILTER, LIST_OPTION, KEYWORDS, SALT_ROUNDS, LIMITPAGE, API_PROFILE, API_CATEGORIES, API_MENU_ITEMS, API_REGISTER, API_LOGIN, API_UPLOAD_IMAGE, API_USERS, API_CHECKOUT, API_ORDERS, API_CHANGE_PASSWORD, API_FORGOT_PASSWORD, API_RESET_PASSWORD, API_COMBO_TYPES, API_COMBO, API_BANNERS, API_REARRANGE, PRESET_TAGS, API_NOTIFICATION, API_PUSHER_AUTH, METHODS, EXCHANGE_RATE_VIETNAM, DIVISION_POINT, POINT_TIERS, MIN_DELIVERY_AMOUNT };

