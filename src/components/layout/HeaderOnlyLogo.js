import { HOME_ROUTE } from '@/constant/routesApp'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import LocaleSelectorClient from '../LocaleSelectorClient'

export default function HeaderOnlyLogo() {
  return (
     <header className="sticky top-0 z-30 hidden max-w-6xl p-4 mx-auto bg-white md:block">
         <div className="flex justify-center">
            <Link href={HOME_ROUTE}>
              <Image src={"/logo.png"}  width={180} height={180}  alt="logo" />
            </Link>
              <LocaleSelectorClient className={"absolute w-max h-max right-0 text-base font-semibold -translate-y-1/2 cursor-pointer text-primary top-1/2"}/>
          </div>
     </header>
  )
}
