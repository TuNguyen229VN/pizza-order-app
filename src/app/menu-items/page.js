"use client";
import Right from "@/components/icons/Right";
import EditTableImage from "@/components/layout/EditTableImage";
import UserTabs from "@/components/layout/UserTabs";
import UseProfile from "@/components/UseProfile";
import { API_MENU_ITEMS } from "@/constant/constant";
import { MENU_ITEM_EDIT_ROUTE, MENU_ITEM_NEW_ROUTE } from "@/constant/routesApp";
import Image from "next/image";
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
    <section className="max-w-2xl mx-auto mt-8">
      <UserTabs isAdmin={profileData.admin}></UserTabs>
      <div className="mt-8">
        <Link className="flex button" href={MENU_ITEM_NEW_ROUTE}><span>Create new menu item</span> <Right /></Link>
      </div>
      <div className="">
        <h2 className="mt-4 text-sm text-gray-500">Edit menu item:</h2>
        <div className="grid grid-cols-3 gap-2">
          {menuItems?.length > 0 && menuItems.map((item) => (
            <Link key={item._id} className="p-4 bg-gray-200 rounded-lg" href={`${MENU_ITEM_EDIT_ROUTE}/${item._id}`}>
              <div className="relative">
                <Image src={item.image} alt={item.name} width={200} height={200} className="rounded-md" />
              </div>
              <div className="text-center">
                {item.name}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
