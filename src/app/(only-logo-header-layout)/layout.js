import HeaderOnlyLogo from '@/components/layout/HeaderOnlyLogo'
import React from 'react'

export default function OnlyLogoHeaderLayout({ children }) {
  return (
    <>
      <HeaderOnlyLogo />
      <main className="max-w-6xl px-4 mx-auto">
        {children}
      </main>
    </>
  )
}
