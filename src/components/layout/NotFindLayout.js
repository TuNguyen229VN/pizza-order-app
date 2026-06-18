import { getLabel } from '@/utils/i18n-utils';
import { useTranslations } from 'next-intl';
import Image from 'next/image'
import React from 'react'

export default function NotFindLayout({ title = "PRODUCT_NOTFOUND_SEARCH", content = "Hãy thử lại với tìm kiếm mới", className }) {
    const sTrans = useTranslations("System");
    return (
        <div className={`flex flex-col items-center text-center ${className}`}>
            <div className="w-[200px] h-[200px] md:w-[300px] md:h-[300px]">
                <Image src={"/images/sorry.png"} alt="sorry" width={200} height={200} className="object-cover object-center w-full h-full" />
            </div>
            <p className="mt-6 text-2xl font-medium">{getLabel(sTrans,title)}</p>
            <p>{getLabel(sTrans,content)}</p>
        </div>
    )
}
