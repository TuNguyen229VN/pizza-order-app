"use client";
import Left from '@/components/icons/Left';
import EditTableImage from '@/components/layout/EditTableImage';
import MenuItemForm from '@/components/layout/MenuItemForm';
import UserTabs from '@/components/layout/UserTabs';
import UseProfile from '@/components/UseProfile';
import { API_MENU_ITEMS } from '@/constant/constant';
import { MENU_ITEMS_ROUTE } from '@/constant/routesApp';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React, { useState } from 'react'
import toast from 'react-hot-toast';

export default function NewMenuItemPage() {
    const { loading: profileLoading, data: profileData } = UseProfile();

    const [redirectToItems, setRedirectToItems] = useState(false)

    const handleFormSubmit = async (e, data) => {
        e.preventDefault();
        const savingPromise = new Promise(async (resolve, reject) => {
            const response = await fetch(API_MENU_ITEMS, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (response.ok) {
                resolve();
            } else {
                reject();
            }
            await toast.promise(savingPromise, {
                loading: "Saving...",
                success: "Saved",
                error: "Error",
            });

           setRedirectToItems(true);
        });
    };

    if(redirectToItems) {
        redirect(MENU_ITEMS_ROUTE);
    }

    if (profileLoading) {
        return "Loading user info...";
    }
    if (!profileData.admin) {
        return "Not an admin";
    }

    return (
        <section className="mt-8">
            <UserTabs isAdmin={profileData.admin}></UserTabs>
            <div className="max-w-md mx-auto mt-8">
                <Link href={MENU_ITEMS_ROUTE} className="button">
                    <Left />
                    <span>Show all menu items</span>
                </Link>
            </div>
            <MenuItemForm onSubmit={handleFormSubmit} menuItem={null}></MenuItemForm>
        </section>
    )
}
