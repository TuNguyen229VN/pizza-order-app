import { PRESET_TAGS } from "@/constant/constant";
import { useState, useRef } from "react";

// Trả về class màu phù hợp với từng tag
function getTagColor(value) {
    const found = PRESET_TAGS.find(p => p.value === value);
    return found ? found.color : "bg-purple-50 text-purple-800 border-purple-200";
}

export default function TagInput({ tags = [], setTags, disabled = false }) {
    const [inputValue, setInputValue] = useState("");
    const inputRef = useRef(null);

    function addTag(raw) {
        const val = raw.trim().replace(/,/g, "").slice(0, 30);
        if (!val || tags.includes(val)) return;
        setTags([...tags, val]);
    }

    function removeTag(index) {
        setTags(tags.filter((_, i) => i !== index));
    }

    function handleKeyDown(e) {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag(inputValue);
            setInputValue("");
        }
        if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
            removeTag(tags.length - 1);
        }
    }

    function handleBlur() {
        if (inputValue.trim()) {
            addTag(inputValue);
            setInputValue("");
        }
    }

    return (
        <div className="mt-1">
            <label className="block my-2 text-sm font-medium">
                Nhãn món ăn
            </label>

            {/* Tag box */}
            <div
                className={`flex flex-wrap gap-1.5 items-center min-h-[44px] py-3 pl-5 pr-8  border rounded-md bg-white cursor-text
                    ${disabled ? "opacity-60 pointer-events-none bg-gray-50" : "border-gray-300 focus-within:border-gray-500  focus:border-black"}`}
                onClick={() => inputRef.current?.focus()}
            >
                {tags.map((tag, i) => (
                    <span
                        key={i}
                        className={`inline-flex items-center gap-1 text-sm font-medium px-4 py-2 rounded-full border ${getTagColor(tag)}`}
                    >
                        {tag}
                        {!disabled && (
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); removeTag(i); }}
                                className="ml-0.5 opacity-60 hover:opacity-100 leading-none text-sm"
                                aria-label={`Xóa nhãn ${tag}`}
                            >
                                ×
                            </button>
                        )}
                    </span>
                ))}
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    disabled={disabled}
                    placeholder={tags.length === 0 ? "Nhập nhãn rồi nhấn Enter" : ""}
                    maxLength={30}
                    className="flex-1 placeholder-gray-400 bg-transparent border-none outline-none"
                />
            </div>

            <p className="mt-2 text-xs text-gray-400">
                Nhấn <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Enter</kbd> hoặc <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">,</kbd> để thêm nhãn. Nhấn <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Backspace</kbd> để xóa nhãn cuối.
            </p>

            {/* Preset quick-select */}
            <div className="mt-2">
                <p className="text-xs text-gray-400 mb-1.5">Chọn nhanh:</p>
                <div className="flex flex-wrap gap-1.5">
                    {PRESET_TAGS.map((preset) => {
                        const isUsed = tags.includes(preset.value);
                        return (
                            <button
                                key={preset.value}
                                type="button"
                                disabled={disabled || isUsed}
                                onClick={() => addTag(preset.value)}
                                className={`text-xs px-3 py-1 rounded-full border transition-all duration-150
                                    ${isUsed
                                        ? "opacity-30 cursor-not-allowed " + preset.color
                                        : preset.color + " hover:opacity-80 active:scale-95"}`}
                            >
                                {preset.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}