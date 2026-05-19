import { useState } from "react";
import InfoIcon from "../icons/InfoIcon";
import { VscEye, VscEyeClosed } from "react-icons/vsc";

// components/ui/ValidatedInput.jsx
const ValidatedInput = ({ important = true, label, name, error, inputRef, type, value, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;
  return (
    <div className="flex flex-col gap-1 ">
      {label && <label className='my-2 text-sm font-medium'>{label} {important && <span className="text-primary">*</span>}</label>}
      <div className="relative">
        <input
          ref={inputRef}
          type={inputType}
          value={value ?? ""}
          className={`w-full py-3 pl-5 pr-8 border rounded-md outline-none  ${error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-black "
            }`}
          {...props}
        />
        {/* Nút mở/đóng mắt cho password */}
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute text-gray-400 -translate-y-1/2 right-2 top-1/2 hover:text-gray-600"
          >
            {showPassword ? (
              // Icon mắt gạch (ẩn password)
              <VscEyeClosed />
            ) : (
              // Icon mắt (hiện password)
              <VscEye />
            )}
          </button>
        )}
        {error && !isPassword && <InfoIcon className={`absolute w-5 h-5 -translate-y-1/2 right-2 top-1/2 text-primary`} />}
      </div>
      {error && (
        <span className="my-1 text-xs text-primary">{error}</span>
      )}
    </div>
  );
};

export default ValidatedInput;