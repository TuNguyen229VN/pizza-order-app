import { HOME_ROUTE } from '@/constant/routesApp'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export default function HeaderOnlyLogo() {
  return (
     <header className="sticky top-0 z-20 max-w-6xl p-4 mx-auto bg-white ">
         <div className="flex justify-center">
            <Link href={HOME_ROUTE}>
              <Image src={"/logo.png"}  width={180} height={180}  alt="logo" />
            </Link>
             <p className="absolute right-0 text-base font-semibold -translate-y-1/2 cursor-pointer text-primary top-1/2">VI</p>
          </div>
     </header>
  )
}
