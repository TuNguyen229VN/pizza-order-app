import Image from "next/image";
import React, { useState } from "react";
import SkeletonLoadingBox from "../skeleton/SkeletonLoadingBox";

const SectionHeader = ({ urlHeader, mainHeader, hasLine = true, classNameTitle = "" }) => {
  const [loadingImage, setLoadingImage] = useState(true)
  return (
    <div>
      <div className="flex w-full">
        <h2 className={`flex relative text-lg md:text-2xl font-semibold uppercase leading-[30px] text-blackHeader w-full items-center gap-4 ${hasLine ? "before:content-[''] before:w-full before:h-[1px] before:bg-[rgb(223,228,234)] before:flex-1 after:content-['']  after:w-full after:h-[1px] after:bg-[rgb(223,228,234)] after:flex-1" : ""}  ${classNameTitle}`}>{mainHeader}</h2>
      </div>
      {urlHeader && <div className="relative mt-3 w-full h-[96px] md:h-[146px] overflow-hidden">
        {loadingImage && <SkeletonLoadingBox className='w-full h-full' />}
        <Image
          src={urlHeader || "/images/slide4.jpg"}
          alt={mainHeader}
          onLoad={() => setLoadingImage(false)}
          fill
          quality={100}
          className={`absolute object-center w-full h-full lg:object-cover ${loadingImage ? "opacity-0" : "opacity-100"}`}
        />
      </div>}
    </div>
  );
};

export default SectionHeader;
