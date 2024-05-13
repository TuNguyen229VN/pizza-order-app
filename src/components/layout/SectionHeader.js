import React from "react";

const SectionHeader = ({ subHeader, mainHeader }) => {
  return (
    <>
      <h3 className="font-semibold leading-3 text-gray-500 uppercase">
        {subHeader}
      </h3>
      <h2 className="text-4xl italic font-bold capitalize text-primary">{mainHeader}</h2>
    </>
  );
};

export default SectionHeader;
