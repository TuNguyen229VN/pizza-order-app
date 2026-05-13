import React from 'react'
import { HiCheck } from "react-icons/hi2";
import { CiGrid2H, CiWarning } from "react-icons/ci";
export default function TotalDashboard({ textAll = "Tổng", textOn = "Đang kinh doanh", textOff = "Tạm đóng", quantityAll = 0, quantityOn = 0, quantityOff = 0 }) {
    return (
        <div className="grid grid-cols-3 gap-6 mt-6">
            <div className="flex gap-4 px-4 py-4 border rounded-xl">
                <div className='p-4 text-red-700 bg-red-200 rounded-2xl text-basefont-semibold'>
                    <CiGrid2H />
                </div>
                <div>
                    <p className='text-sm text-secondary first-letter:uppercase'>{textAll}</p>
                    <p className='text-lg font-medium'>{quantityAll}</p>
                </div>
            </div>
            <div className="flex gap-4 px-4 py-4 border rounded-xl">
                <div className='p-4 text-green-700 bg-green-200 rounded-2xl text-basefont-semibold'>
                    <HiCheck />
                </div>
                <div>
                    <p className='text-sm text-secondary first-letter:uppercase'>{textOn}</p>
                    <p className='text-lg font-medium'>{quantityOn}</p>
                </div>
            </div>
            <div className="flex gap-4 px-4 py-4 border rounded-xl">
                <div className='p-4 text-yellow-700 bg-yellow-200 rounded-2xl text-basefont-semibold'>
                    <CiWarning />
                </div>
                <div>
                    <p className='text-sm text-secondary first-letter:uppercase'>{textOff}</p>
                    <p className='text-lg font-medium'>{quantityOff}</p>
                </div>
            </div>
        </div>
    )
}
