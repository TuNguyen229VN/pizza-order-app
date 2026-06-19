import { useTranslations } from 'next-intl';
import React from 'react'

export default function ComboSummary({ slots = [], categories }) {
    const sTrans = useTranslations("System");
    return (
        <>
            {slots.length > 0 && (
                <div className="p-3 mt-4 text-[#333] text-sm border border-gray-200 bg-red-50 rounded-xl">
                    <p className="mb-1 font-medium">{sTrans("Tóm tắt combo")}:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                        {slots.map((slot, idx) => {
                            const cat = categories.find((c) => c._id === slot.category);
                            return (
                                <li key={idx}>
                                    <strong>{slot.label || cat?.name || "?"}</strong>  {slot.size?.name ? ` [${slot.size.name}]` : ""} — {slot.quantity} món
                                    {cat && slot.label && cat.name !== slot.label ? ` (${cat.name})` : ""}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </>
    )
}
