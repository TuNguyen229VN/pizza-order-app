// lib/i18n-utils.ts

export const getLabel = (t, name) => {
    try {
        return t(name);
    } catch {
        return name;
    }
};