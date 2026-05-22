import Header from '@/components/layout/Header'
import React from 'react'

export default function NoFooterLayout({ children }) {
    return (
        <>
            <Header className={"hidden md:block"}/>
            <main className="max-w-6xl mx-auto ">
                {children}
            </main>
        </>
    )
}
