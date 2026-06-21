export const createValidators = (t) => ({
  required: (text) => (value) => {
    if (!value || value.toString().trim() === "") return t("required", { field: text });
    return null;
  },

  requiredSelect: (text) => (value) => {
    if (value === null || value === undefined || value === "" || value === -1)
      return t("requiredSelect", { field: text });
    return null;
  },

  minLength: (min) => (value) => {
    if (!value) return null;
    if (value.length < min) return t("minLength", { min });
    return null;
  },

  maxLength: (max) => (value) => {
    if (!value) return null;
    if (value.length > max) return t("maxLength", { max });
    return null;
  },

  isNumber: (text = t("defaultFieldName")) => (value) => {
    if (value === null || value === undefined || value === "") return null;
    if (isNaN(Number(value)) || value.toString().trim() === "")
      return t("isNumber", { field: text });
    return null;
  },

  minValue: (min, text = t("defaultFieldName")) => (value) => {
    if (value === null || value === undefined || value === "") return null;
    if (Number(value) < min) return t("minValue", { field: text, min: min.toLocaleString() });
    return null;
  },

  maxValue: (max, text = t("defaultFieldName")) => (value) => {
    if (value === null || value === undefined || value === "") return null;
    if (Number(value) > max) return t("maxValue", { field: text, max: max.toLocaleString() });
    return null;
  },

  passwordStrength: () => (value) => {
    if (!value) return null;
    const checks = [
      /[a-z]/.test(value),
      /[A-Z]/.test(value),
      /[0-9]/.test(value),
      /[^A-Za-z0-9]/.test(value),
    ];
    if (checks.includes(false)) return t("passwordStrength");
    return null;
  },

  matchField: (otherValue, text = t("defaultPasswordName")) => (value) => {
    if (value && value !== otherValue) return t("matchField", { field: text });
    return null;
  },

  email: (value) => {
    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    const trimmed = value?.trim();
    if (trimmed && !emailRegex.test(trimmed)) return t("email");
    return null;
  },

  phone: (value) => {
    const phoneRegex = /^[0-9]{10,11}$/;
    if (value && !phoneRegex.test(value)) return t("phone");
    return null;
  },

  pastDate: (value) => {
    if (value && new Date(value) >= new Date()) return t("pastDate");
    return null;
  },

  ageDate: (min, max) => (value) => {
    if (!value) return null;
    const today = new Date();
    const birthDate = new Date(value);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    if (age > max || age < min) return t("ageDate");
    return null;
  },
});

// validate / validateForm giữ nguyên, không cần t
export const validate = (value, rules = []) => {
  for (const rule of rules) {
    const error = rule(value);
    if (error) return error;
  }
  return null;
};

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