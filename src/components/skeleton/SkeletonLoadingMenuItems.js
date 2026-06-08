import React from 'react'
import SkeletonLoadingBox from './SkeletonLoadingBox';

export default function SkeletonLoadingMenuItems({ recomStyle }) {
  return (
    <div className={`flex-shrink-0 flex h-[156px] md:h-[230px] border md:rounded-2xl cursor-pointer overflow-hidden group transition duration-300 md:hover:shadow-[0_3px_8px_rgba(0,0,0,0.1)] ${recomStyle === "recomStyle" ? "rounded-2xl md:h-[190px] " : ""}`}>
      <SkeletonLoadingBox className={`${recomStyle === "recomStyle" ? "w-[111px] md:w-[161px]" : "w-[130px]  lg:w-[220px]"} h-full shrink-0 overflow-hidden relative`} />
      {/* Text side */}
      <div className="flex flex-col justify-between flex-1 w-full p-4 pl-2">
        <div>
          <SkeletonLoadingBox className="md:h-5 lg:h-7" />
          <SkeletonLoadingBox className="w-full h-3 mt-2 md:h-4" />
        </div>
        <div className={`flex items-center justify-between ${recomStyle=== "recomStyle"?"w-[225px]":""}`}>
          <div className='w-full'>
            <SkeletonLoadingBox className="w-1/2 h-3 mb-2" />
            <SkeletonLoadingBox className="w-1/2 h-4" />
          </div>
          <SkeletonLoadingBox className="w-8 border rounded-full h-7 md:w-10 md:h-9 lg:w-12 lg:h-11" />
        </div>
      </div>
    </div>
  );
}
