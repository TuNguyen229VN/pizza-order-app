// lib/i18n-utils.ts

export const getLabel = (t, name) => {
    if (!name) return name;
    const key = name.normalize("NFC").replace(/\s+/g, " ").trim();
    const value = t.has(key) ? t(key) : name;
    return value;
};