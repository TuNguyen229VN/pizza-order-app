import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import React from 'react'

export default function StandardLayout({ children }) {
    return (
        <>
            <Header />
            <main className="mx-auto md:max-w-6xl">
                {children}
            </main>
            <Footer />
        </>
    )
}
