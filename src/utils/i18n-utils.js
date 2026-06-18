// lib/i18n-utils.ts

export const getLabel = (t, name) => {
    const value = t.has(name) ? t(name) : name;
    return value;
};