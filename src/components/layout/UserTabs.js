"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const UserTabs = ({ isAdmin }) => {
  const path = usePathname();
  return (
    <div className="flex justify-center gap-2 mx-auto tabs">
      <Link className={path === "/profile" ? "active" : ""} href={"/profile"}>
        Profile
      </Link>
      {isAdmin && (
        <>
          <Link
            className={path === "/categories" ? "active" : ""}
            href={"/categories"}
          >
            Categories
          </Link>
          <Link
            className={path === "/menu-items" ? "active" : ""}
            href={"/menu-items"}
          >
            Menu Items
          </Link>
          <Link className={path === "/users" ? "active" : ""} href={"/users"}>
            Users
          </Link>
        </>
      )}
    </div>
  );
};

export default UserTabs;
