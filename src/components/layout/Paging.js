import React from 'react'
import ChevronLeft from '../icons/ChevronLeft'
import ChevronRight from '../icons/ChevronRight'

export default function Paging({ page, setPage, totalPages, total, items }) {
    return (
        <div className="flex items-center justify-between py-4 border-t px-gutter text-body-md text-secondary border-outline-variant">
            <p>
                Hiển thị {items?.length} của {total} mục
            </p>
            <div className="flex gap-1">
                <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center justify-center w-8 h-8 border rounded border-outline-variant hover:bg-surface-container-low disabled:opacity-50"
                >
                    <ChevronLeft />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`flex items-center justify-center w-8 h-8 font-bold border rounded ${page === p
                            ? "border-primary bg-primary text-white"
                            : "border-outline-variant hover:bg-surface-container-low"
                            }`}
                    >
                        {p}
                    </button>
                ))}

                <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex items-center justify-center w-8 h-8 border rounded border-outline-variant hover:bg-surface-container-low disabled:opacity-50"
                >
                    <ChevronRight />
                </button>
            </div>
        </div>
    )
}
