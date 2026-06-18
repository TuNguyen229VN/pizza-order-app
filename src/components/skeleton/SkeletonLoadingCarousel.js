import SkeletonLoadingBox from "./SkeletonLoadingBox";
 
export default function SkeletonLoadingCarousel() {
  return (
    <div className="sticky z-10 pt-3 md:pt-6 top-[65px] md:top-[80px] bg-white flex gap-20 px-6 overflow-hidden">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-2 shrink-0 md:h-[72px]">
          <SkeletonLoadingBox className="w-6 h-6 rounded-full md:w-10 md:h-10" />
          <SkeletonLoadingBox className="w-24 h-3" />
        </div>
      ))}
    </div>
  );
}
 