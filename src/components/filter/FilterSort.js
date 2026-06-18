import { getLabel } from '@/utils/i18n-utils';
import { useTranslations } from 'next-intl';
import React from 'react'

export default function FilterSort({ sort, setSort, listOption = [] }) {
    const sTrans = useTranslations("System");
    return (
        <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="flex-1 w-full px-3 py-2 border rounded border-outline-variant text-body-md focus:outline-none focus:border-black"
        >
            {listOption.length > 0 && listOption.map((option, index) => (
                <option key={index} value={option.value}>{getLabel(sTrans,option.label)}</option>
            ))}
        </select>
    )
}
