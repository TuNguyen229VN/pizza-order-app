import HeaderOnlyLogo from '@/components/layout/HeaderOnlyLogo'
import React from 'react'

export default function OnlyLogoHeaderLayout({ children }) {
  return (
    <>
      <HeaderOnlyLogo />
      <main className="max-w-6xl mx-auto">
        {children}
      </main>
    </>
  )
}
