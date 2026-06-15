import { METHODS } from "@/constant/constant";
import Image from "next/image";


const PaymentMethodSelect = ({ value, onChange }) => {
  return (
    <div className="flex flex-col gap-3">
      {METHODS.map((method) => {
        const isSelected = value === method.value;
        return (
          <div
            key={method.value}
            onClick={() => onChange(method.value)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer 
              }`}
          >
            {/* Radio dot */}
            <div className={`w-[18px] h-[18px] rounded-full flex items-center justify-center flex-shrink-0
              ${isSelected ? "border-2 border-primary" : "border border-gray-300"}`}>
              {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
            </div>

            {/* Icon */}
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${method.iconBg}`}>
              <Image src={method.icon} alt={method.value} width={200} height={200}/>
            </div>

            {/* Text */}
            <div>
              <p className="text-sm font-medium">{method.label}</p>
              <p className="text-xs text-gray-500">{method.sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PaymentMethodSelect;