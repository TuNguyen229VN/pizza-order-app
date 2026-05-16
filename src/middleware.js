import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import {
    CATEGORIES_ROUTE,
    CHANGEPASSWORD_ROUTE,
    LOGIN_ROUTE,
    MENU_ITEMS_ROUTE,
    NOTIFICATION_ROUTE,
    ORDERS_ROUTE,
    PROFILE_ROUTE,
    REGISTER_ROUTE,
    USERS_ROUTE,
} from "./constant/routesApp";

// Match chính xác từng pattern
const exact = (route) => new RegExp(`^${route}$`)
const withId = (route) => new RegExp(`^${route}/[^/]+$`)

// route chỉ dành cho đã login
const protectedRoutePatterns = [
    exact(PROFILE_ROUTE),
    exact(CHANGEPASSWORD_ROUTE),
    exact(NOTIFICATION_ROUTE),
    exact(CATEGORIES_ROUTE),
    exact(ORDERS_ROUTE),
    // withId(ORDERS_ROUTE),                    // /orders/123
    exact(MENU_ITEMS_ROUTE),
    exact(MENU_ITEMS_ROUTE + "/new"),
    exact(MENU_ITEMS_ROUTE + "/edit"),
    withId(MENU_ITEMS_ROUTE + "/edit"),      // /menu-items/edit/123
    exact(USERS_ROUTE),
    withId(USERS_ROUTE),         // /users/abc  | /users/abc/xyz  → 404
];

// route chỉ dành cho role admin
const adminRoutePatterns = [
    exact(CATEGORIES_ROUTE),
    exact(ORDERS_ROUTE),
    // withId(ORDERS_ROUTE),
    exact(MENU_ITEMS_ROUTE),
    exact(MENU_ITEMS_ROUTE + "/new"),
    exact(MENU_ITEMS_ROUTE + "/edit"),
    withId(MENU_ITEMS_ROUTE + "/edit"),
    exact(USERS_ROUTE),
    withId(USERS_ROUTE),

];

// chưa login thì route này
const authRoutes = [LOGIN_ROUTE, REGISTER_ROUTE];

function isProtectedRoute(pathname) {
    return protectedRoutePatterns.some(pattern => pattern.test(pathname));
}

function isAuthRoute(pathname) {
    return authRoutes.includes(pathname);
}

function isAdminRoute(pathname) {
    return adminRoutePatterns.some(pattern => pattern.test(pathname));
}

export async function middleware(req) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const pathname = req.nextUrl.pathname;
    if (token && isAuthRoute(pathname) && token.status === "off") {
        return NextResponse.redirect(new URL("/", req.url));
    }

    if (!token && isProtectedRoute(pathname)) {
        const loginUrl = new URL(LOGIN_ROUTE, req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Đã login nhưng không phải admin mà vào admin route → redirect về "/"
    if (token && isAdminRoute(pathname) && !token.admin) {
        return NextResponse.redirect(new URL(PROFILE_ROUTE, req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
        "/profile",
        "/profile/change-password",
        '/profile/notification',
        "/categories",
        "/orders",
        // "/orders/:id*",
        "/menu-items",
        "/menu-items/new",
        "/menu-items/edit",
        "/menu-items/edit/:id*",
        "/users",
        "/users/:id*",
        "/login",
        "/register",
    ],
};