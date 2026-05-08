// hooks/useFormValidate.js
import { validateForm } from "@/libs/validators";
import { useRef, useState } from "react";


export const useFormValidate = () => {
  const [errors, setErrors] = useState({});
  const inputRefs = useRef({});

  // Đăng ký ref cho từng input
  const registerRef = (name) => (el) => {
    if (el) inputRefs.current[name] = el;
  };

  const handleValidate = (fields) => {
    const { errors: newErrors, firstErrorKey, isValid } = validateForm(fields);
    setErrors(newErrors);

    // Focus và scroll đến input lỗi đầu tiên
    if (firstErrorKey && inputRefs.current[firstErrorKey]) {
      inputRefs.current[firstErrorKey].focus();
      inputRefs.current[firstErrorKey].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }

    return isValid;
  };

  const clearError = (name) => {
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  return { errors, registerRef, handleValidate, clearError, setErrors };
};