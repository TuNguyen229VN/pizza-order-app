// lib/i18n-utils.ts
export const visibleText = (s) =>
  (s ?? "").normalize("NFC").replace(/[^\p{L}\p{N}\p{P}\p{S}]/gu, "");

export const getSlotLabel = (slot, idx) => {
  const label = (slot?.label ?? "").trim();
  return visibleText(label) ? label : (
    visibleText(slot?.category?.name) ? slot.category.name.trim() : `Slot ${idx + 1}`
  );
};

export const getLabel = (t, name) => {
    if (!name) return name;
    const key = name.normalize("NFC").replace(/\s+/g, " ").trim();
    const value = t.has(key) ? t(key) : name;
    return value;
};