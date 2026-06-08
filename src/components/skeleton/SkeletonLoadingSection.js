import React from 'react'
import SkeletonLoadingMenuCombo from './SkeletonLoadingMenuCombo';
import SkeletonLoadingSectionHeader from './SkeletonLoadingSectionsHeader';
import SkeletonLoadingMenuItems from './SkeletonLoadingMenuItems';

export default function SkeletonLoadingSection({ type = "item", count = 4 }) {
   return (
    <div className="mb-8 md:mb-12">
      <div className="text-center">
        <SkeletonLoadingSectionHeader />
      </div>
 
      {type === "combo" ? (
        <div className="grid gap-4 px-4 mt-4 md:px-0 md:gap-6 md:grid-cols-2">
          {Array.from({ length: count }).map((_, i) => (
            <SkeletonLoadingMenuCombo key={i} />
          ))}
        </div>
      ) : (
        <div className="grid mt-4 md:gap-6 md:grid-cols-2">
          {Array.from({ length: count }).map((_, i) => (
            <SkeletonLoadingMenuItems key={i} />
          ))}
        </div>
      )}
    </div>
  );
}
