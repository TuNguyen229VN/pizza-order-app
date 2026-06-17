import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import React from 'react'

export default function StandardLayout({ children }) {
    if (typeof window !== "undefined") {
        window.onerror = function (msg, url, line, col, error) {
            alert(`Error: ${msg}\nLine: ${line}\nStack: ${error?.stack}`);
        };
    }
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
