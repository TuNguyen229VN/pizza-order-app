export const validators = {
  required: (text) => (value) => {
    if (!value || value.toString().trim() === "") return `Vui lòng nhập ${text}`;
    return null;
  },

  minLength: (min) => (value) => {
    if (value && value.length < min) return `Tối thiểu ${min} ký tự`;
    return null;
  },

  maxLength: (max) => (value) => {
    if (value && value.length > max) return `Tối đa ${max} ký tự`;
    return null;
  },

  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) return "Vui lòng nhập email hợp lệ";
    return null;
  },

  phone: (value) => {
    const phoneRegex = /^[0-9]{10,11}$/;
    if (value && !phoneRegex.test(value)) return "Số điện thoại không hợp lệ";
    return null;
  },

  pastDate: (value) => {
    if (value && new Date(value) >= new Date()) return "Ngày sinh của bạn không hợp lệ";
    return null;
  },
  ageDate: (min, max) => (value) => {
    if (!value) return null;

    const today = new Date();
    const birthDate = new Date(value);

    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    if (age > max || age < min) {
      return "Ngày sinh của bạn không hợp lệ";
    }

    return null;
  },
};

// Chạy nhiều rule cùng lúc, trả về lỗi đầu tiên gặp
export const validate = (value, rules = []) => {
  for (const rule of rules) {
    const error = rule(value);
    if (error) return error;
  }
  return null;
};

// Validate toàn bộ form
export const validateForm = (fields) => {
  const errors = {};
  let firstErrorKey = null;

  for (const [key, { value, rules }] of Object.entries(fields)) {
    const error = validate(value, rules);
    if (error) {
      errors[key] = error;
      if (!firstErrorKey) firstErrorKey = key;
    }
  }

  return { errors, firstErrorKey, isValid: Object.keys(errors).length === 0 };
};