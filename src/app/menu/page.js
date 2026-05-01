"use client"
import SectionHeader from '@/components/layout/SectionHeader'
import MenuItems from '@/components/menu/MenuItems'
import { API_CATEGORIES, API_MENU_ITEMS } from '@/constant/constant'
import React, { useEffect, useState } from 'react'

export default function MenuPage() {
    const [categories, setCategories] = useState([])
    const [menuItems, setMenuItems] = useState([])
    useEffect(() => {
        fetch(API_CATEGORIES).then(res => {
            res.json().then(categories => setCategories(categories))
        })

        fetch(API_MENU_ITEMS).then(res => {
            res.json().then(menuItems => setMenuItems(menuItems))
        })
    }, [])

    return (
        <section className='mt-8'>
            {categories.length > 0 && categories.map(c => (
                <div key={c._id}>
                    <div className="text-center">
                        <SectionHeader mainHeader={c.name} />
                    </div>
                    <div className='grid grid-cols-3 gap-4 mt-6 mb-12'>
                        {menuItems.filter(item => item.category == c._id).map(item => (
                            <MenuItems key={item._id} {...item} />
                        ))}
                    </div>
                </div>
            ))}
        </section>
    )
}
