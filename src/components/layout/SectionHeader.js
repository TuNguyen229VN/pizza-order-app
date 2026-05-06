import Image from "next/image";
import React from "react";

const SectionHeader = ({ urlHeader, mainHeader }) => {
  return (
    <div>
      <div className="flex w-full">
        <h2 className="flex relative text-2xl font-semibold uppercase leading-[30px] text-blackHeader w-full items-center gap-4 before:content-[''] before:w-full before:h-[1px] before:bg-[rgb(223,228,234)] before:flex-1 after:content-['']  after:w-full after:h-[1px] after:bg-[rgb(223,228,234)]    after:flex-1">{mainHeader}</h2>
      </div>
      {urlHeader && <Image src={urlHeader ? urlHeader : "/images/slide4.jpg"} alt={mainHeader} width={200} height={200} className="w-full object-cover h-[146px] mt-3 object-center" />}
    </div>
  );
};

export default SectionHeader;
