import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import {
    BANNER_ROUTE, CATEGORIES_ROUTE, CHANGEPASSWORD_ROUTE,
    COMBO_ROUTE, COMBOTYPE_ROUTE, FORGOTPASSWORD_ROUTE,
    LOGIN_ROUTE, MENU_ITEMS_ROUTE, NOTIFICATION_ROUTE,
    ORDER_TRACKING_ROUTE, ORDERS_ROUTE, PROFILE_ROUTE,
    REARRANGE_ROUTE, REGISTER_ROUTE, USERS_ROUTE,
} from "./constant/routesApp";
import { API_BANNERS, API_CATEGORIES, API_CHANGE_PASSWORD, API_CHECKOUT, API_COMBO, API_COMBO_TYPES, API_FORGOT_PASSWORD, API_LOGIN, API_MENU_ITEMS, API_NOTIFICATION, API_ORDERS, API_PROFILE, API_REARRANGE, API_REGISTER, API_RESET_PASSWORD, API_UPLOAD_IMAGE, API_USERS } from "./constant/constant";

const SUPPORTED_LOCALES = ["vi", "en"];

const exact = (route) => new RegExp(`^${route}$`);
const withId = (route) => new RegExp(`^${route}/[^/]+$`);

const protectedRoutePatterns = [
    exact(PROFILE_ROUTE), exact(CHANGEPASSWORD_ROUTE), exact(NOTIFICATION_ROUTE),
    exact(CATEGORIES_ROUTE), exact(ORDERS_ROUTE), exact(MENU_ITEMS_ROUTE),
    exact(MENU_ITEMS_ROUTE + "/new"), exact(MENU_ITEMS_ROUTE + "/edit"),
    withId(MENU_ITEMS_ROUTE + "/edit"), exact(USERS_ROUTE), withId(USERS_ROUTE),
    exact(COMBOTYPE_ROUTE), exact(COMBOTYPE_ROUTE + "/new"), exact(COMBOTYPE_ROUTE + "/edit"),
    withId(COMBOTYPE_ROUTE + "/edit"), exact(COMBO_ROUTE), exact(COMBO_ROUTE + "/new"),
    exact(COMBO_ROUTE + "/edit"), withId(COMBO_ROUTE + "/edit"),
    exact(ORDER_TRACKING_ROUTE), exact(BANNER_ROUTE), exact(REARRANGE_ROUTE),
];

const adminRoutePatterns = [
    exact(CATEGORIES_ROUTE), exact(ORDERS_ROUTE), exact(MENU_ITEMS_ROUTE),
    exact(MENU_ITEMS_ROUTE + "/new"), exact(MENU_ITEMS_ROUTE + "/edit"),
    withId(MENU_ITEMS_ROUTE + "/edit"), exact(USERS_ROUTE), withId(USERS_ROUTE),
    exact(COMBOTYPE_ROUTE), exact(COMBOTYPE_ROUTE + "/new"), exact(COMBOTYPE_ROUTE + "/edit"),
    withId(COMBOTYPE_ROUTE + "/edit"), exact(COMBO_ROUTE), exact(COMBO_ROUTE + "/new"),
    exact(COMBO_ROUTE + "/edit"), withId(COMBO_ROUTE + "/edit"),
    exact(BANNER_ROUTE), exact(REARRANGE_ROUTE),
];

const authRoutes = [LOGIN_ROUTE, REGISTER_ROUTE, FORGOTPASSWORD_ROUTE];

const isProtectedRoute = (p) => protectedRoutePatterns.some((r) => r.test(p));
const isAuthRoute = (p) => authRoutes.includes(p);
const isAdminRoute = (p) => adminRoutePatterns.some((r) => r.test(p));

// ─── Rate limit cho API ─────────────────────────────────────────
const rateLimitMap = new Map();
const WINDOW_MS = 60 * 1000;

// path prefix -> max requests / phút (tùy độ nhạy cảm)
const RATE_LIMIT_RULES = [
    // ── Checkout / Orders — chặn spam tạo đơn ảo ────────────
    { prefix: API_CHECKOUT, max: 8 },
    { prefix: API_ORDERS, max: 8 },

    // ── Auth — chặn brute-force / spam tài khoản ────────────
    { prefix: API_LOGIN, max: 10 },
    { prefix: API_REGISTER, max: 5 },
    { prefix: API_FORGOT_PASSWORD, max: 5 },
    { prefix: API_RESET_PASSWORD, max: 5 },
    { prefix: API_CHANGE_PASSWORD, max: 10 },

    // ── Admin CRUD — chặn spam thao tác hàng loạt ───────────
    { prefix: API_CATEGORIES, max: 20 },
    { prefix: API_MENU_ITEMS, max: 20 },
    { prefix: API_COMBO_TYPES, max: 20 },
    { prefix: API_COMBO, max: 20 },
    { prefix: API_BANNERS, max: 20 },
    { prefix: API_REARRANGE, max: 20 },
    { prefix: API_USERS, max: 20 },

    // ── Upload ảnh — tốn resource/storage, nên giới hạn thấp ─
    { prefix: API_UPLOAD_IMAGE, max: 10 },

    // ── Profile / Notification — ít nhạy cảm hơn, max cao hơn ─
    { prefix: API_PROFILE, max: 30 },
    { prefix: API_NOTIFICATION, max: 30 },
];

function getRateLimitRule(pathname) {
    return RATE_LIMIT_RULES.find((r) => pathname.startsWith(r.prefix));
}

function checkRateLimit(req) {
    const pathname = req.nextUrl.pathname;
    const method = req.method;

    if (!["POST", "PUT", "DELETE"].includes(method)) return null;

    const rule = getRateLimitRule(pathname);
    if (!rule) return null;

    const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        "unknown";

    const key = `${ip}:${pathname}`;
    const now = Date.now();

    const timestamps = rateLimitMap.get(key) || [];
    const recent = timestamps.filter((t) => now - t < WINDOW_MS);

    if (recent.length >= rule.max) {
        return NextResponse.json(
            { message: "Quá nhiều request, vui lòng thử lại sau" },
            { status: 429 }
        );
    }

    recent.push(now);
    rateLimitMap.set(key, recent);

    if (rateLimitMap.size > 5000) {
        for (const [k, v] of rateLimitMap.entries()) {
            const stillRecent = v.filter((t) => now - t < WINDOW_MS);
            if (stillRecent.length === 0) rateLimitMap.delete(k);
            else rateLimitMap.set(k, stillRecent);
        }
    }

    return null;
}

export async function middleware(req) {
    const pathname = req.nextUrl.pathname;

    // ── Nhánh API: chỉ rate limit, không check auth/locale ──────
    if (pathname.startsWith("/api")) {
        const limited = checkRateLimit(req);
        if (limited) return limited;
        return NextResponse.next();
    }

    // ── Nhánh trang: giữ nguyên logic auth + locale cũ ──────────
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    const localeCookie = req.cookies.get("locale")?.value;
    const locale = SUPPORTED_LOCALES.includes(localeCookie) ? localeCookie : "vi";

    const response = (() => {
        if (token && isAuthRoute(pathname) && token.status === "off") {
            return NextResponse.redirect(new URL("/", req.url));
        }
        if (!token && isProtectedRoute(pathname)) {
            const loginUrl = new URL(LOGIN_ROUTE, req.url);
            loginUrl.searchParams.set("callbackUrl", pathname);
            return NextResponse.redirect(loginUrl);
        }
        if (token && isAdminRoute(pathname) && !token.admin) {
            return NextResponse.redirect(new URL(PROFILE_ROUTE, req.url));
        }
        return NextResponse.next();
    })();

    response.headers.set("x-locale", locale);

    if (!SUPPORTED_LOCALES.includes(localeCookie)) {
        response.cookies.set("locale", locale, {
            path: "/",
            maxAge: 31536000,
        });
    }

    return response;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
    ],
};