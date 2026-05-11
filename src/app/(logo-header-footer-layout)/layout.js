import Footer from '@/components/layout/Footer'
import HeaderOnlyLogo from '@/components/layout/HeaderOnlyLogo'
import React from 'react'

export default function LogoHeaderFooterLayout({ children }) {
    return (
        <>
            <HeaderOnlyLogo />
            <main className="max-w-6xl mx-auto">
                {children}
            </main>
            <Footer />
        </>
    )
}
