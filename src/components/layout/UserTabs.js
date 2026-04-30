"use client";
import { CATEGORIES_ROUTE, MENU_ITEMS_ROUTE, ORDERS_ROUTE, PROFILE_ROUTE, USERS_ROUTE } from "@/constant/routesApp";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const UserTabs = ({ isAdmin }) => {
  const path = usePathname();
  return (
    <div className="flex justify-center gap-2 mx-auto tabs">
      <Link className={path === PROFILE_ROUTE ? "active" : ""} href={PROFILE_ROUTE}>
        Profile
      </Link>
      {isAdmin && (
        <>
          <Link
            className={path === CATEGORIES_ROUTE ? "active" : ""}
            href={CATEGORIES_ROUTE}
          >
            Categories
          </Link>
          <Link
            className={path.includes(MENU_ITEMS_ROUTE) ? "active" : ""}
            href={MENU_ITEMS_ROUTE}
          >
            Menu Items
          </Link>
          <Link className={path.includes(USERS_ROUTE) ? "active" : ""} href={USERS_ROUTE}>
            Users
          </Link>
          <Link className={path === ORDERS_ROUTE ? "active" : ""} href={ORDERS_ROUTE}>
            Orders
          </Link>
        </>
      )}
    </div>
  );
};

export default UserTabs;
