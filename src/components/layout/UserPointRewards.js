import React from 'react'
import { GiFullPizza } from 'react-icons/gi'
import UseProfile from '../UseProfile';
import { getUserTier } from '@/libs/pointTier';
import { POINT_TIERS } from '@/constant/constant';
import { useTranslations } from 'next-intl';
import { getLabel } from '@/utils/i18n-utils';

export default function UserPointRewards() {
    const { data: profileData } = UseProfile();
    const rTrans = useTranslations("Rewards");

    const points = profileData?.pointRewards ?? 0;

    const LOWEST_TIER = { minPoints: 0, discountPercent: 0, label: "Thành viên Thường" };
    const POINT_TIERS_DESC = [...POINT_TIERS].sort((a, b) => b.minPoints - a.minPoints);
    // Thêm LOWEST_TIER vào cuối mảng để findIndex hoạt động đúng
    const ALL_TIERS = [...POINT_TIERS_DESC, LOWEST_TIER];
    // => [{1000}, {500}, {200}, {50}, {0}]

    const currentTier = ALL_TIERS.find((t) => points >= t.minPoints) || LOWEST_TIER;

    const currentIndex = ALL_TIERS.findIndex(
        (t) => t.minPoints === currentTier.minPoints
    );
    // currentIndex của LOWEST_TIER = 4, nextTier = ALL_TIERS[3] = {minPoints: 50} ✅

    const nextTier = currentIndex > 0 ? ALL_TIERS[currentIndex - 1] : null;

    const currentMin = currentTier.minPoints;
    const nextMin = nextTier?.minPoints;

    const progress = nextMin !== undefined
        ? ((points - currentMin) / (nextMin - currentMin)) * 100
        : 100;

    return (
        <div className='p-5 mb-6 border rounded-2xl'>
            <div className='p-4 px-5 text-white rounded-lg bg-primary'>
                <div className='flex items-center gap-4 mb-4'>
                    <GiFullPizza className='w-6 h-6' />
                    <p className='font-medium'>{getLabel(rTrans, currentTier?.label) || rTrans("Thành viên Thường")}</p>
                </div>
                <div className='flex flex-row items-center justify-between md:flex-col lg:flex-row'>
                    <div>
                        <span className='text-[40px] font-semibold'>{points}</span>
                        <span className='ml-2 text-sm'>{rTrans("điểm")}</span>
                    </div>
                    <div>
                        <span className='text-[40px] font-semibold'>{currentTier?.discountPercent || 0}%</span>
                        <span className='ml-2 text-sm'>{rTrans("giảm giá")}</span>
                    </div>
                </div>
                <div className="mt-4">
                    <div className="flex justify-between mb-1 text-xs">
                        <span>{currentMin} {rTrans("điểm")}</span>
                        {/* ✅ Fix chỗ MAX */}
                        <span>{nextMin !== undefined ? `${nextMin} ${rTrans("điểm")}` : "MAX"}</span>
                    </div>
                    <div className="w-full h-3 overflow-hidden rounded-full bg-white/30">
                        <div
                            className="h-full transition-all duration-500 bg-white rounded-full"
                            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                        />
                    </div>
                    {nextTier && (
                        <p className="mt-2 text-xs">
                            {rTrans("Còn")} {nextMin - points} {rTrans("điểm để đạt")} {getLabel(rTrans, nextTier.label)}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
