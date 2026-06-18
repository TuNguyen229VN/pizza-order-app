import { useState } from "react";
import { METHODS } from "@/constant/constant";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { getLabel } from "@/utils/i18n-utils";

const PaymentMethodSelect = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const selected = METHODS.find((m) => m.value === value);
  const sTrans = useTranslations("System");
  return (
    <>
      {/* Desktop: danh sách bình thường */}
      <div className="flex-col hidden gap-3 md:flex">
        {METHODS.map((method) => {
          const isSelected = value === method.value;
          return (
            <div
              key={method.value}
              onClick={() => onChange(method.value)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer border
                ${isSelected ? "border-primary" : "border-gray-200"}`}
            >
              <div className={`w-[18px] h-[18px] rounded-full flex items-center justify-center flex-shrink-0
                ${isSelected ? "border-2 border-primary" : "border border-gray-300"}`}>
                {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
              </div>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${method.iconBg}`}>
                <Image src={method.icon} alt={method.value} width={200} height={200} />
              </div>
              <div>
                <p className="text-sm font-medium">{getLabel(sTrans, method.label)}</p>
                <p className="text-xs text-gray-500">{getLabel(sTrans, method.sub)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile (< md): dropdown */}
      <div className="relative md:hidden">
        <div
          onClick={() => setOpen((o) => !o)}
          className="flex items-center justify-between gap-3 px-4 py-3 border rounded-md cursor-pointer"
        >
          <p className="font-semibold">{sTrans("Phương thức thanh toán")}</p>
          <div className="flex gap-2">
            <p className="text-sm font-medium">{getLabel(sTrans, selected?.label)}</p>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {open && (
          <div className="absolute left-0 right-0 z-10 mt-1 overflow-hidden bg-white border border-gray-200 shadow-lg top-full rounded-xl">
            {METHODS.map((method) => {
              const isSelected = value === method.value;
              return (
                <div
                  key={method.value}
                  onClick={() => { onChange(method.value); setOpen(false); }}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50
                    ${isSelected ? "bg-primary/5" : ""}`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${method.iconBg}`}>
                    <Image src={method.icon} alt={method.value} width={200} height={200} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{getLabel(sTrans,method.label)}</p>
                    <p className="text-xs text-gray-500">{getLabel(sTrans,method.sub)}</p>
                  </div>
                  {isSelected && (
                    <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default PaymentMethodSelect;