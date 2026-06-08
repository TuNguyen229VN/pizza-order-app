import SkeletonLoadingBox from "./SkeletonLoadingBox";


 
export default function SkeletonLoadingSlider() {
  return (
    <div className="w-full overflow-hidden">
      <SkeletonLoadingBox className="w-full h-[240px] md:h-[442px] overflow-hidden md:rounded-2xl" />
    </div>
  );
}
 