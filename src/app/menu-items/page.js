"use client";
import Right from "@/components/icons/Right";
import EditTableImage from "@/components/layout/EditTableImage";
import UserTabs from "@/components/layout/UserTabs";
import UseProfile from "@/components/UseProfile";
import { API_MENU_ITEMS } from "@/constant/constant";
import { MENU_ITEM_NEW_ROUTE } from "@/constant/routesApp";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function MenuItemsPage() {
  const [menuItems, setMenuItems] = useState([]);
  const { loading: profileLoading, data: profileData } = UseProfile();

  useEffect(() => {
    fetch(API_MENU_ITEMS).then((response) => {
      response.json().then((menuItems) => {
        setMenuItems(menuItems);
      });
    });
  }, [])

  if (profileLoading) {
    return "Loading user info...";
  }
  if (!profileData.admin) {
    return "Not an admin";
  }
  return (
    <section className="max-w-md mx-auto mt-8">
      <UserTabs isAdmin={profileData.admin}></UserTabs>
      <div className="mt-8">
        <Link className="flex button" href={MENU_ITEM_NEW_ROUTE}><span>Create new menu item</span> <Right /></Link>
      </div>
    </section>
  );
}
