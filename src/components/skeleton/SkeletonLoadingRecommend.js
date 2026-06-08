import React from 'react'
import SkeletonLoadingMenuItems from './SkeletonLoadingMenuItems';

export default function SkeletonLoadingRecommend({count}) {
    return (
            <div className="flex justify-between w-full gap-10 overflow-hidden">
                {Array.from({ length: count }).map((_, i) => (
                    <SkeletonLoadingMenuItems recomStyle={"recomStyle"} key={i} />
                ))}
            </div>
    );
}
