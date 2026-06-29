"use client"
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react'
import ConfirmPopup from '../popup/ConfirmPopup';
import { signOut } from 'next-auth/react';
import { BANNER_ROUTE, CATEGORIES_ROUTE, CHANGEPASSWORD_ROUTE, COMBO_ROUTE, COMBOTYPE_ROUTE, DASHBOARD_ROUTE, LOGIN_ROUTE, MENU_ITEMS_ROUTE, NOTIFICATION_ROUTE, ORDER_TRACKING_ROUTE, ORDERS_ROUTE, PROFILE_ROUTE, REARRANGE_ROUTE, REGISTER_ROUTE, REWARDS_ROUTE, USERS_ROUTE } from '@/constant/routesApp';
import { useNotificationContext } from '@/context/NotificationContext';
import { useTranslations } from 'next-intl';
import LocaleSelectorMobile from '../LocaleSelectorMobile';

export default function MenuMobile({ isAdmin, status, onClose }) {
    const path = usePathname();
    const { unreadCount } = useNotificationContext();
    const sTrans = useTranslations("System");
    return (
        <div className='fixed bottom-0 left-0 z-30 w-full overflow-y-auto bg-white top-16 md:hidden'>
            {status === "unauthenticated" && (
                <div className='border-b'>
                    <Link href={LOGIN_ROUTE} onClick={onClose} className="block py-3 pl-4 hover:font-medium hover:text-primary">{sTrans("Đăng nhập")}</Link>
                    <Link href={REGISTER_ROUTE} onClick={onClose} className="block py-3 pl-4 hover:font-medium hover:text-primary">{sTrans("Đăng ký")}</Link>
                </div>
            )}
            <div className={`${status === "unauthenticated" ? "border-b" : ""}`}>
                <Link href={ORDER_TRACKING_ROUTE} className='inline-block p-3' onClick={onClose}>
                    {sTrans("Theo dõi đơn hàng")}
                </Link>
                <LocaleSelectorMobile />
                <Link href={REWARDS_ROUTE} className='inline-block p-3' onClick={onClose}>
                    {sTrans("Teo Rewards")}
                </Link>
            </div>
            <ConfirmPopup labelConfirm="Gọi ngay" label="Hỗ trợ khách hàng" labelDesc={`${sTrans("gọi đến")} 1900 1822`} onDelete={() => {
                onClose?.();
                window.location.href = 'tel:0123456789'
            }}>
                <p className="p-3 py-3 hover:font-medium hover:text-primary" >{sTrans("Hỗ trợ khách hàng")}</p>
            </ConfirmPopup>
            {status === "authenticated" && <>
                <div className="flex flex-col border-t border-b">
                    <Link className={`flex items-center p-3 hover:text-primary  ${path === PROFILE_ROUTE ? "text-primary font-semibold" : ""}`} href={PROFILE_ROUTE} onClick={onClose} >
                        <span>{sTrans("Hồ sơ của tôi")}</span>
                    </Link>
                    {isAdmin && (
                        <>
                            <Link
                                className={`flex items-center p-3 hover:text-primary ${path === DASHBOARD_ROUTE ? "text-primary font-semibold" : ""}`}
                                href={DASHBOARD_ROUTE}
                                onClick={onClose}
                            >
                                <span>{sTrans("Thống kê tổng quan")}</span>
                            </Link>
                            <Link
                                className={`flex items-center p-3 hover:text-primary ${path === BANNER_ROUTE ? "text-primary font-semibold" : ""}`}
                                href={BANNER_ROUTE}
                                onClick={onClose}
                            >
                                <span>{sTrans("Quản lý banner")}</span>
                            </Link>
                            <Link
                                className={`flex items-center p-3 hover:text-primary ${path === CATEGORIES_ROUTE ? "text-primary font-semibold" : ""}`}
                                href={CATEGORIES_ROUTE}
                                onClick={onClose}
                            >
                                <span>{sTrans("Quản lý danh mục")}</span>
                            </Link>
                            <Link
                                className={`flex items-center p-3 hover:text-primary  ${path.includes(MENU_ITEMS_ROUTE) ? "text-primary font-semibold" : ""}`}
                                href={MENU_ITEMS_ROUTE}
                                onClick={onClose}
                            >
                                <span>{sTrans("Quản lý món ăn")}</span>
                            </Link>
                            <Link
                                className={`flex items-center p-3 hover:text-primary  ${path.startsWith(COMBOTYPE_ROUTE) ? "text-primary font-semibold" : ""}`}
                                href={COMBOTYPE_ROUTE}
                                onClick={onClose}
                            >
                                <span>{sTrans("Quản lý loại combo")}</span>
                            </Link>
                            <Link
                                className={`flex items-center p-3 hover:text-primary  ${path.startsWith(COMBO_ROUTE) &&
                                    !path.startsWith(COMBOTYPE_ROUTE) ? "text-primary font-semibold" : ""}`}
                                href={COMBO_ROUTE}
                                onClick={onClose}
                            >
                                <span>{sTrans("Quản lý combo")}</span>
                            </Link>
                            <Link className={`flex items-center p-3 hover:text-primary  ${path.includes(USERS_ROUTE) ? "text-primary font-semibold" : ""}`} href={USERS_ROUTE} onClick={onClose} >
                                <span>{sTrans("Quản lý người dùng")}</span>
                            </Link>
                            <Link className={`flex items-center p-3 hover:text-primary ${path === ORDERS_ROUTE ? "text-primary font-semibold" : ""}`} href={ORDERS_ROUTE} onClick={onClose} >
                                <span>{sTrans("Quản lý đơn hàng")}</span>
                            </Link>
                            <Link className={`flex items-center p-3 hover:text-primary ${path === REARRANGE_ROUTE ? "text-primary font-semibold" : ""}`} href={REARRANGE_ROUTE} onClick={onClose} >
                                <span>{sTrans("Sắp xếp hiển thị sản phẩm")}</span>
                            </Link>
                        </>
                    )}
                    <Link className={`flex items-center hover:text-primary gap-2 p-3 ${path === NOTIFICATION_ROUTE ? "text-primary font-semibold" : ""}`} href={NOTIFICATION_ROUTE} onClick={onClose} >
                        <span>{sTrans("Thông báo")}</span>
                        {unreadCount > 0 && (
                            <span className="flex items-center justify-center p-2 text-xs text-center text-white bg-red-500 rounded-full">
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        )}
                    </Link>
                    <Link className={`flex items-center hover:text-primary p-3 ${path === CHANGEPASSWORD_ROUTE ? "text-primary font-semibold" : ""}`} href={CHANGEPASSWORD_ROUTE} onClick={onClose} >
                        <span>{sTrans("Đổi mật khẩu")}</span>
                    </Link>
                </div>
                <div className="hover:text-primary">
                    <ConfirmPopup classNameButton="w-full" label="Đăng xuất" labelConfirm="Đăng xuất" onDelete={() => {
                        onClose?.();
                        signOut();
                    }}>
                        <div className="flex items-center p-3 ">
                            <p>{sTrans("Đăng xuất")}</p>
                        </div>
                    </ConfirmPopup>
                </div>
            </>}
        </div>
    )
}
