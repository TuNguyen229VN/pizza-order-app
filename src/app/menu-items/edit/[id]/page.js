"use client";
import Left from '@/components/icons/Left';
import EditTableImage from '@/components/layout/EditTableImage';
import MenuItemForm from '@/components/layout/MenuItemForm';
import UserTabs from '@/components/layout/UserTabs';
import UseProfile from '@/components/UseProfile';
import { API_MENU_ITEMS } from '@/constant/constant';
import { MENU_ITEMS_ROUTE } from '@/constant/routesApp';
import { MenuItem } from '@/models/MenuItem';
import Link from 'next/link';
import { redirect, useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';

export default function EditMenuItemPage() {
    const { id } = useParams();
    const { loading: profileLoading, data: profileData } = UseProfile();

    const [menuItem, setMenuItem] = useState(null)
    const [redirectToItems, setRedirectToItems] = useState(false)

    useEffect(() => {
        fetch(API_MENU_ITEMS).then(response => {
            response.json().then(items => {
                const item = items.find(i => i._id === id);
                if (item) {
                    setMenuItem(item);
                }
            })
        })

    }, [id])

   const handleTest = () => {
        const data = { name: "Test", description: "Test", image: "https://via.placeholder.com/150", price: 10, category: "Test" }
        fetch(API_MENU_ITEMS, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(response => {
            if (response.ok) {
                console.log("Menu item created successfully");      } else {
                console.error("Error creating menu item");
            }   })
    }   
    
    const handleFormSubmit = async (e, formData) => {
        e.preventDefault();
        const data = {  _id: id,...formData };
        console.log(data)
        const savingPromise = new Promise(async (resolve, reject) => {
            const response = await fetch(API_MENU_ITEMS, {
                method: "PUT",
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

    if (redirectToItems) {
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
            <MenuItemForm onSubmit={handleFormSubmit} menuItem={menuItem}></MenuItemForm>
        </section>
    )
}
