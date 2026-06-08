import SkeletonLoadingBox from "./SkeletonLoadingBox";
 
export default function SkeletonLoadingCarousel() {
  return (
    <div className="sticky z-10 pt-3 md:pt-6 top-[65px] md:top-[80px] bg-white flex gap-20">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-2 shrink-0 md:h-[72px]">
          <SkeletonLoadingBox className="w-10 h-10 rounded-full" />
          <SkeletonLoadingBox className="w-24 h-3" />
        </div>
      ))}
    </div>
  );
}
 