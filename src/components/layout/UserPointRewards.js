import React from 'react'
import { GiFullPizza } from 'react-icons/gi'
import UseProfile from '../UseProfile';
import { getUserTier } from '@/libs/pointTier';
import { POINT_TIERS } from '@/constant/constant';

export default function UserPointRewards() {
    const { data: profileData } = UseProfile();
    const tier = getUserTier(profileData?.pointRewards);

    const points = profileData?.pointRewards || 0;

    const currentTier =
        POINT_TIERS.find((t) => points >= t.minPoints) || null;

    // tìm tier kế tiếp
    const currentIndex = POINT_TIERS.findIndex(
        (t) => t.minPoints === currentTier?.minPoints
    );

    const nextTier =
        currentIndex > 0 ? POINT_TIERS[currentIndex - 1] : null;

    const currentMin = currentTier?.minPoints || 0;
    const nextMin = nextTier?.minPoints;

    const progress = nextMin
        ? ((points - currentMin) / (nextMin - currentMin)) * 100
        : 100;
    return (
        <div className='p-5 mb-6 border rounded-2xl'>
            <div className='p-4 px-5 text-white rounded-lg bg-primary'>
                <div className='flex items-center gap-4 mb-4'>
                    <GiFullPizza className='w-6 h-6' />
                    <p className='font-medium'>{tier?.label || "Thành viên Thường"}</p>
                    <div className=''></div>
                </div>
                <div className='flex flex-col items-center justify-between lg:flex-row'>
                    <div className=''>
                        <span className='text-[40px] font-semibold'>{profileData?.pointRewards || 0}</span>
                        <span className='ml-2 text-sm'>điểm</span>
                    </div>
                    <div className=''>
                        <span className='text-[40px] font-semibold'>{tier?.discountPercent || 0}%</span>
                        <span className='ml-2 text-sm'>giảm giá</span>
                    </div>
                </div>
                <div className="mt-4">
                    <div className="flex justify-between mb-1 text-xs">
                        <span>{currentMin} điểm</span>
                        <span>{nextMin || "MAX"} điểm</span>
                    </div>

                    <div className="w-full h-3 overflow-hidden rounded-full bg-white/30">
                        <div
                            className="h-full transition-all duration-500 bg-white rounded-full"
                            style={{
                                width: `${Math.min(100, Math.max(0, progress))}%`,
                            }}
                        />
                    </div>

                    {nextTier && (
                        <p className="mt-2 text-xs">
                            Còn {nextMin - points} điểm để đạt {nextTier.label}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
