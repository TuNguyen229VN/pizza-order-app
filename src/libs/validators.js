export const validators = {
  required: (text) => (value) => {
    if (!value || value.toString().trim() === "") return `Vui lòng nhập ${text}`;
    return null;
  },

  requiredSelect: (text) => (value) => {
    if (value === null || value === undefined || value === "" || value === -1)
      return `Vui lòng chọn ${text}`;
    return null;
  },

  minLength: (min) => (value) => {
    if (!value) return null;
    if (value && value.length < min) return `Tối thiểu ${min} ký tự`;
    return null;
  },

  maxLength: (max) => (value) => {
    if (!value) return null;
    if (value && value.length > max) return `Tối đa ${max} ký tự`;
    return null;
  },

  isNumber: (text = "Giá trị") => (value) => {
    if (value === null || value === undefined || value === "") return null;
    if (isNaN(Number(value)) || value.toString().trim() === "")
      return `${text} phải là số hợp lệ`;
    return null;
  },

  minValue: (min, text = "Giá trị") => (value) => {
    if (value === null || value === undefined || value === "") return null;
    if (Number(value) < min) return `${text} phải lớn hơn hoặc bằng ${min.toLocaleString()}`;
    return null;
  },

  maxValue: (max, text = "Giá trị") => (value) => {
    if (value === null || value === undefined || value === "") return null;
    if (Number(value) > max) return `${text} phải nhỏ hơn hoặc bằng ${max.toLocaleString()}`;
    return null;
  },

  passwordStrength: (minScore = 4) => (value) => {
    if (!value) return null;

    const checks = [
      { pass: /[a-z]/.test(value), msg: "chữ thường" },
      { pass: /[A-Z]/.test(value), msg: "chữ hoa" },
      { pass: /[0-9]/.test(value), msg: "số" },
      { pass: /[^A-Za-z0-9]/.test(value), msg: "ký tự đặc biệt" },
    ];

    const failed = checks.filter((c) => !c.pass).map((c) => c.msg);

    if (failed.length > 0) {
      return `Mật khẩu phải có ít nhất 6 ký tự và bao gồm [Chữ cái viết hoa], [Chữ cái viết thường], [Số] và [Ký tự đặc biệt].`;
    }

    return null;
  },

  // passwordStrength: (minScore = 2) => (value) => {
  //   if (!value) return null;
  //   let score = 0;
  //   if (value.length >= 8) score++;              // đủ dài
  //   if (/[A-Z]/.test(value)) score++;            // có chữ hoa
  //   if (/[0-9]/.test(value)) score++;            // có số
  //   if (/[^A-Za-z0-9]/.test(value)) score++;     // có ký tự đặc biệt

  //   const levels = ["Rất yếu", "Yếu", "Trung bình", "Mạnh", "Rất mạnh"];
  //   if (score < minScore) return `Mật khẩu ${levels[score]} — cần chữ hoa, số, ký tự đặc biệt`;
  //   return null;
  // },

  matchField: (otherValue, text = "Mật khẩu") => (value) => {
    if (value && value !== otherValue) return `${text} không khớp`;
    return null;
  },

  email: (value) => {
    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    const trimmed = value?.trim();
    if (trimmed && !emailRegex.test(trimmed)) return "Vui lòng nhập email hợp lệ";
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