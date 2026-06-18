"use client";
import { BANNER_ROUTE, CATEGORIES_ROUTE, CHANGEPASSWORD_ROUTE, COMBO_ROUTE, COMBOTYPE_ROUTE, MENU_ITEMS_ROUTE, NOTIFICATION_ROUTE, ORDERS_ROUTE, PROFILE_ROUTE, REARRANGE_ROUTE, USERS_ROUTE } from "@/constant/routesApp";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import UserIcon from "../icons/UserIcon";
import CategoryIcon from "../icons/CategoryIcon";
import { PiFlagBanner, PiPizzaLight, PiUserListLight } from "react-icons/pi";
import { BsCartCheck } from "react-icons/bs";
import { TbLockPassword } from "react-icons/tb";
import Bell from "../icons/Bell";
import ConfirmPopup from "../popup/ConfirmPopup";
import SignOutIcon from "../icons/SignOutIcon";
import { signOut } from "next-auth/react";
import { MdOutlineFastfood } from "react-icons/md";
import { FiPackage } from "react-icons/fi";
import { GrSystem } from "react-icons/gr";
import { useNotificationContext } from "@/context/NotificationContext";
import UserPointRewards from "./UserPointRewards";
import { useTranslations } from "next-intl";

const UserTabs = ({ isAdmin }) => {
  const path = usePathname();
  const { unreadCount } = useNotificationContext();
   const sTrans = useTranslations("System");
  return (
    <div className="hidden md:block">
      <UserPointRewards />
      <div className="flex flex-col border rounded-2xl">
        <Link className={`flex items-center p-4 gap-4 text-lg ${path === PROFILE_ROUTE ? "text-primary font-semibold" : ""}`} href={PROFILE_ROUTE}>
          <UserIcon />
          <span>{sTrans("Hồ sơ của tôi")}</span>
        </Link>
        {isAdmin && (
          <>
            <Link
              className={`flex items-center p-4 gap-4 text-lg ${path === BANNER_ROUTE ? "text-primary font-semibold" : ""}`}
              href={BANNER_ROUTE}
            >
              <PiFlagBanner className="w-6 h-6" />
              <span>{sTrans("Quản lý banner")}</span>
            </Link>
            <Link
              className={`flex items-center p-4 gap-4 text-lg ${path === CATEGORIES_ROUTE ? "text-primary font-semibold" : ""}`}
              href={CATEGORIES_ROUTE}
            >
              <CategoryIcon />
              <span>{sTrans("Quản lý danh mục")}</span>
            </Link>
            <Link
              className={`flex items-center p-4 gap-4 text-lg ${path.includes(MENU_ITEMS_ROUTE) ? "text-primary font-semibold" : ""}`}
              href={MENU_ITEMS_ROUTE}
            >
              <PiPizzaLight className="w-6 h-6" />
              <span>{sTrans("Quản lý món ăn")}</span>
            </Link>
            <Link
              className={`flex items-center p-4 gap-4 text-lg ${path.startsWith(COMBOTYPE_ROUTE) ? "text-primary font-semibold" : ""}`}
              href={COMBOTYPE_ROUTE}
            >
              <FiPackage className="w-6 h-6" />
              <span>{sTrans("Quản lý loại combo")}</span>
            </Link>
            <Link
              className={`flex items-center p-4 gap-4 text-lg ${path.startsWith(COMBO_ROUTE) &&
                !path.startsWith(COMBOTYPE_ROUTE) ? "text-primary font-semibold" : ""}`}
              href={COMBO_ROUTE}
            >
              <MdOutlineFastfood className="w-6 h-6" />
              <span>{sTrans("Quản lý combo")}</span>
            </Link>
            <Link className={`flex items-center p-4 gap-4 text-lg ${path.includes(USERS_ROUTE) ? "text-primary font-semibold" : ""}`} href={USERS_ROUTE}>
              <PiUserListLight className="w-6 h-6" />
              <span>{sTrans("Quản lý người dùng")}</span>
            </Link>
            <Link className={`flex items-center p-4 gap-4 text-lg ${path === ORDERS_ROUTE ? "text-primary font-semibold" : ""}`} href={ORDERS_ROUTE}>
              <BsCartCheck className="w-6 h-6" />
              <span>{sTrans("Quản lý đơn hàng")}</span>
            </Link>
            <Link className={`flex items-center p-4 gap-4 text-lg ${path === REARRANGE_ROUTE ? "text-primary font-semibold" : ""}`} href={REARRANGE_ROUTE}>
              <GrSystem className="w-6 h-6" />
              <span>{sTrans("Sắp xếp hiển thị sản phẩm")}</span>
            </Link>
          </>
        )}
        <Link className={`flex items-center p-4 gap-4 text-lg ${path === NOTIFICATION_ROUTE ? "text-primary font-semibold" : ""}`} href={NOTIFICATION_ROUTE}>
          <Bell />
          <span>{sTrans("Thông báo")}</span>
          {unreadCount > 0 && (
            <span className="flex items-center justify-center p-2 px-4 text-xs text-center text-white bg-red-500 rounded-full">
              {unreadCount}
            </span>
          )}
        </Link>
        <Link className={`flex items-center p-4 gap-4 text-lg ${path === CHANGEPASSWORD_ROUTE ? "text-primary font-semibold" : ""}`} href={CHANGEPASSWORD_ROUTE}>
          <TbLockPassword className="w-6 h-6" />
          <span>{sTrans("Đổi mật khẩu")}</span>
        </Link>
      </div>
      <div className="mt-6 border rounded-2xl">
        <ConfirmPopup classNameButton="w-full" label="Đăng xuất" labelConfirm="Đăng xuất" onDelete={() => signOut()}>
          <div className="flex items-center gap-4 p-5 text-lg">
            <SignOutIcon />
            <p>{sTrans("Đăng xuất")}</p>
          </div>
        </ConfirmPopup>
      </div>
    </div>
  );
};

export default UserTabs;
