import { getLabel } from '@/utils/i18n-utils';
import { useTranslations } from 'next-intl';
import React from 'react'

export default function ContainerProfileLeft({ title, children, className }) {
   const sTrans = useTranslations("System");
  return (
    <div className={`px-4 md:p-4 md:border md:rounded-2xl ${className} overflow-hidden`}>
      <p className='text-2xl md:text-[28px] font-semibold leading-10 capitalize text-blackHeader '>{getLabel(sTrans,title)}</p>
      {children}
    </div>
  )
}
