import React from 'react'
import SkeletonLoadingBox from './SkeletonLoadingBox';

export default function SkeletonLoadingMenuCombo() {
  return (
    <div className="flex flex-row h-[132px] md:h-full border rounded-2xl cursor-pointer overflow-hidden group transition duration-300 md:hover:shadow-[0_3px_8px_rgba(0,0,0,0.1)] md:flex-col }">
      {/* Image */}
      <SkeletonLoadingBox className="h-full md:h-[285px] w-[130px] md:w-full overflow-hidden shrink-0" />
      {/* Content */}
      <div className="flex flex-col justify-center w-full gap-2 p-2 md:p-4">
        <SkeletonLoadingBox className="w-2/3 h-3 md:h-7" />
        <div className='flex flex-col-reverse gap-2 md:flex-col'>
          <SkeletonLoadingBox className="w-full h-3" />
          <SkeletonLoadingBox className="w-1/3 h-4 mt-1" />
        </div>
      </div>
    </div>
  );
}
