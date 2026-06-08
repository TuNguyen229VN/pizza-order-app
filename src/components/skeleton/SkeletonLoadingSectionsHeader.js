import SkeletonLoadingBox from "./SkeletonLoadingBox";

export default function SkeletonLoadingSectionHeader({ hasImage = true }) {
  return (
    <div>
      <div className="flex w-full">
        <div className="flex relative text-lg md:text-2xl font-semibold uppercase leading-[30px] text-blackHeader w-full items-center gap-4 before:content-[''] before:w-full before:h-[1px] before:bg-[rgb(223,228,234)] before:flex-1 after:content-['']  after:w-full after:h-[1px] after:bg-[rgb(223,228,234)] after:flex-1">
          <SkeletonLoadingBox className="w-[100px] h-10" />
        </div>
      </div>
      {hasImage && <div className="relative mt-3 w-full h-[96px] md:h-[146px] overflow-hidden">
        <SkeletonLoadingBox className="w-full h-full" />
      </div>}
    </div>
  );
}
