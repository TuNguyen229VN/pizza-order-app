import React from "react";

const SectionHeader = ({ subHeader, mainHeader }) => {
  return (
    <div className="flex w-full">
      {/* <div className="w-full h-[1px] bg-blackHeader"></div> */}
      <h2 className="flex relative text-2xl font-semibold uppercase leading-[30px] text-blackHeader w-full items-center gap-4
  before:content-['']  before:w-full before:h-[1px] before:bg-[rgb(223,228,234)] before:flex-1
  after:content-['']  after:w-full after:h-[1px] after:bg-[rgb(223,228,234)]    after:flex-1">{mainHeader}</h2>
      {/* <div className="w-full h-[1px] bg-blackHeader"></div> */}
    </div>
  );
};

export default SectionHeader;
