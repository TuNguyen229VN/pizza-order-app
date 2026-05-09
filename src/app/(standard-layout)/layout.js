import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import React from 'react'

export default function StandardLayout({ children }) {
    return (
        <>
            <Header />
            <main className="max-w-6xl px-4 mx-auto">
                {children}
            </main>
            <Footer />
        </>
    )
}
