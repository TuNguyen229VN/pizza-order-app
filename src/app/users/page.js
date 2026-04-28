"use client";
import UserTabs from '@/components/layout/UserTabs'
import UseProfile from '@/components/UseProfile';
import { API_USERS } from '@/constant/constant';
import React, { useEffect, useState } from 'react'

export default function UsersPage() {
    const { loading: profileLoading, data: profileData } = UseProfile();

    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetch(API_USERS).then(response => {
            response.json().then(users => {
                setUsers(users)
            })
        })
    }, [])

    if (profileLoading) {
        return "Loading user info...";
    }
    if (!profileData.admin) {
        return "Not an admin";
    }

    return (
        <div className='max-w-2xl mx-auto mt-8'>
            <UserTabs isAdmin={profileData.admin}></UserTabs>
            <div className='mt-8'>
                {users.length > 0 && users.map(user => (
                    <div key={user._id} className='flex items-center gap-4 p-1 px-4 mb-2 bg-gray-100 rounded-lg'>
                        <div className='flex gap-4 grow'>
                            <div className='text-gray-700'>
                                {user.name && (<span>{user.name}</span>)}
                                {!user.name && (<span className='italic'>No name</span>)}
                            </div>
                            <span className='text-gray-300'>{user.email}</span>
                        </div>
                        <div>
                            <button>Edit</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
