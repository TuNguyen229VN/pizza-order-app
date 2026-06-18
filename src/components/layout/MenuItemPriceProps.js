import React, { useState } from 'react'
import Trash from '../icons/Trash'
import Plus from '../icons/Plus'
import ChevronDown from '../icons/ChevronDown';
import ChevronUp from '../icons/ChevronUp';
import ValidatedInput from '../input/ValidatedInput';
import ConfirmPopup from '../popup/ConfirmPopup';
import CloseIcon from '../icons/CloseIcon';
import { useTranslations } from 'next-intl';
import { getLabel } from '@/utils/i18n-utils';

export default function MenuItemPriceProps({ name, addLabel, props, setProps, errors, clearError, registerRef, fieldKey, disabled }) {
    const sTrans = useTranslations("System");
    const [isOpen, setIsOpen] = useState(false)

    const addProps = () => {
        setProps(oldProps => {
            return [...oldProps, { name: "", price: "" }];
        });
    }

    const editProps = (e, index, field) => {
        setProps(prev => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: e.target.value };
            return next;
        });
        clearError(`${fieldKey}_${index}_${field}`);
    }

    const hasError = props?.some((_, i) =>
        errors[`${fieldKey}_${i}_name`] || errors[`${fieldKey}_${i}_price`]
    );

    function moveSlot(idx, dir) {
        if (disabled) return
        setProps((prev) => {
            const arr = [...prev];
            const target = idx + dir;
            if (target < 0 || target >= arr.length) return arr;
            [arr[idx], arr[target]] = [arr[target], arr[idx]];
            return arr;
        });
    }

    const removeProps = (indexToRemove) => {
        setProps(prev => prev.filter((v, index) => index !== indexToRemove))
    }

    return (
        <div className="p-3 mt-6 mb-2 border rounded-md">
            <button
                className="inline-flex justify-start w-full p-1 ml-1 text-sm font-medium border-0"
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(prev => !prev)}
            >
                {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                <span className="ml-1">{getLabel(sTrans,name)}</span>
                <span className="ml-1">({props?.length})</span>
                {hasError && <span className="ml-2 text-xs text-red-500">{sTrans("Có lỗi cần sửa")}</span>}
            </button>

            <div className={isOpen ? "block" : "hidden"}>
                {props?.length > 0 && props.map((item, index) => (
                    <div key={index} className="relative flex flex-col items-start gap-2 p-4 mt-2 border-b-2 sm:border-b-0 sm:p-0 sm:flex-row">
                        <ValidatedInput
                            label="Tên"
                            name={`${fieldKey}_${index}_name`}
                            value={item.name}
                            inputRef={registerRef(`${fieldKey}_${index}_name`)}
                            error={errors[`${fieldKey}_${index}_name`]}
                            placeholder={sTrans("Nhập tên")}
                            disabled={disabled}
                            onChange={(e) => editProps(e, index, "name")}
                        />
                        <ValidatedInput
                            label="Giá thêm"
                            name={`${fieldKey}_${index}_price`}
                            value={item.price}
                            disabled={disabled}
                            inputRef={registerRef(`${fieldKey}_${index}_price`)}
                            error={errors[`${fieldKey}_${index}_price`]}
                            placeholder={sTrans("Nhập giá")}
                            onChange={(e) => editProps(e, index, "price")}
                        />
                        <div className='absolute top-0 right-0 flex items-center gap-2 sm:top-0'>
                            <button
                                type="button"
                                onClick={() => moveSlot(index, -1)}
                                disabled={index === 0}
                                className={`p-1 text-lg text-gray-400 hover:text-gray-600 disabled:opacity-30 ${disabled ? "pointer-events-none" : "cursor-pointer"}`}
                                title={sTrans("Di chuyển lên")}
                            >
                                ▲
                            </button>
                            <button
                                type="button"
                                onClick={() => moveSlot(index, 1)}
                                disabled={index === props.length - 1}
                                className={`p-1 text-lg text-gray-400 hover:text-gray-600 disabled:opacity-30 ${disabled ? "pointer-events-none" : "cursor-pointer"}`}
                                title={sTrans("Di chuyển xuống")}
                            >
                                ▼
                            </button>
                            <ConfirmPopup onDelete={() => removeProps(index)} label='Xóa' disabled={disabled}>
                                <p title={sTrans("Xóa")}>
                                    <CloseIcon className='w-6 h-6 text-primary' />
                                </p>
                            </ConfirmPopup>
                        </div>
                    </div>
                ))}

                <button type="button" onClick={addProps} className="flex items-center mt-3 font-medium bg-white text-primary" disabled={disabled}>
                    <Plus className="w-4 h-4" />
                    <span className="ml-1">{getLabel(sTrans,addLabel)}</span>
                </button>
            </div>
        </div>
    );

}
