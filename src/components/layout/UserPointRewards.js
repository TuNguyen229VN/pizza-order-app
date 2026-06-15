import React from 'react'
import { GiFullPizza } from 'react-icons/gi'
import UseProfile from '../UseProfile';
import { getUserTier } from '@/libs/pointTier';

export default function UserPointRewards() {
    const { data: profileData } = UseProfile();
    const tier = getUserTier(profileData?.pointRewards);
    return (
        <div className='p-5 mb-6 border rounded-2xl'>
            <div className='p-4 px-5 text-white rounded-lg bg-primary'>
                <div className='flex items-center gap-4 mb-4'>
                    <GiFullPizza className='w-6 h-6' />
                    <p className='font-medium'>{tier?.label||"Thành viên Thường"}</p>
                </div>
                <div className='flex flex-col items-center justify-between lg:flex-row'>
                    <div className=''>
                        <span className='text-[40px] font-semibold'>{profileData?.pointRewards||0}</span>
                        <span className='ml-2 text-sm'>điểm</span>
                    </div>
                    <div className=''>
                        <span className='text-[40px] font-semibold'>{tier?.discountPercent||0}%</span>
                        <span className='ml-2 text-sm'>giảm giá</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
