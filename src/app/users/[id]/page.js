"use client";
import UserForm from '@/components/layout/UserForm';
import UserTabs from '@/components/layout/UserTabs'
import UseProfile from '@/components/UseProfile';
import { API_PROFILE, API_USERS } from '@/constant/constant';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';

export default function EditUserPage() {
    const { loading: profileLoading, data: profileData } = UseProfile();
    const [user, setUser] = useState(null);
    const { id } = useParams()

    useEffect(() => {
        fetch(`${API_PROFILE}?_id=${id}`).then(res => {
            res.json().then(user => {
                setUser(user);
            })
        })

    }, [])

    const handleSaveButtonClick = async (e, data) => {
        e.preventDefault();
        const savingPromise = new Promise(async (resolve, reject) => {
            const response = await fetch(API_PROFILE, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...data, _id: id }),
            })
            if (response.ok) {
                resolve();
            } else {
                reject();
            }
        });
        await toast.promise(savingPromise, {
            loading: "Saving...",
            success: "Profile saved",
            error: "Error",
        });

    }

    if (profileLoading) {
        return "Loading user info...";
    }
    if (!profileData.admin) {
        return "Not an admin";
    }

    return (
        <section className='max-w-2xl mx-auto mt-8'>
            <UserTabs isAdmin={profileData.admin}></UserTabs>
            <div className="mt-8">
                <UserForm user={user} onSave={handleSaveButtonClick} />
            </div>
        </section>
    )
}
