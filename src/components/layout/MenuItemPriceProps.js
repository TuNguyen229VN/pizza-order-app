import React, { useState } from 'react'
import Trash from '../icons/Trash'
import Plus from '../icons/Plus'
import ChevronDown from '../icons/ChevronDown';
import ChevronUp from '../icons/ChevronUp';
import ValidatedInput from '../input/ValidatedInput';
import ConfirmPopup from '../popup/ConfirmPopup';

export default function MenuItemPriceProps({ name, addLabel, props, setProps, errors, clearError, registerRef, fieldKey }) {

    const [isOpen, setIsOpen] = useState(false)

    const addProps = () => {
        setProps(oldProps => {
            return [...oldProps, { name: "", price: 0 }];
        });
    }


    const editProps = (e, index, field) => {
        const newValue = e.target.value;
        setProps(prev => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: newValue };
            return next;
        });
        clearError(`${fieldKey}_${index}_${field}`);
    }

    const hasError = props?.some((_, i) =>
        errors[`${fieldKey}_${i}_name`] || errors[`${fieldKey}_${i}_price`]
    );

    const removeProps = (indexToRemove) => {
        setProps(prev => prev.filter((v, index) => index !== indexToRemove))
    }

    return (
        // <div className="p-3 mt-6 mb-2 border rounded-md">
        //     <button className="inline-flex justify-start w-full p-1 ml-1 text-sm font-medium border-0" type='button' onClick={() => setIsOpen(prev => !prev)}>{isOpen ? (<ChevronUp className='w-5 h-5' />) : (<ChevronDown className='w-5 h-5' />)}<span className='ml-1'>{name}</span>
        //         <span className='ml-1'>({props?.length})</span></button>
        //     <div className={isOpen ? "block" : "hidden"}>
        //         {props?.length > 0 && props.map((size, index) => (
        //             <div key={index} className="flex items-end gap-2">
        //                 <div className="">
        //                     <label htmlFor="">Size name</label>
        //                     <input
        //                         type="text"
        //                         placeholder="Size name"
        //                         value={size.name}
        //                         onChange={(e) => editProps(e, index, "name")}
        //                     />
        //                 </div>
        //                 <div className="">
        //                     <label htmlFor="">Extra price</label>
        //                     <input
        //                         type="text"
        //                         placeholder="Extra price"
        //                         value={size.price}
        //                         onChange={(e) => editProps(e, index, "price")}
        //                     />
        //                 </div>
        //                 <div className="">
        //                     <button className='px-2 mb-2 bg-white' type='button' onClick={() => removeProps(index)}><Trash /></button>
        //                 </div>
        //             </div>
        //         ))}
        //         <button type='button' onClick={addProps} className='items-center bg-white'><Plus className='w-4 h-4' /> <span>{addLabel}</span></button></div>

        // </div>
        <div className="p-3 mt-6 mb-2 border rounded-md">
            <button
                className="inline-flex justify-start w-full p-1 ml-1 text-sm font-medium border-0"
                type="button"
                onClick={() => setIsOpen(prev => !prev)}
            >
                {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                <span className="ml-1">{name}</span>
                <span className="ml-1">({props?.length})</span>
                {hasError && <span className="ml-2 text-xs text-red-500">Có lỗi cần sửa</span>}
            </button>

            <div className={isOpen ? "block" : "hidden"}>
                {props?.length > 0 && props.map((item, index) => (
                    <div key={index} className="relative flex items-start gap-2 mt-2">
                        <ValidatedInput
                            label="Tên"
                            name={`${fieldKey}_${index}_name`}
                            value={item.name}
                            inputRef={registerRef(`${fieldKey}_${index}_name`)}
                            error={errors[`${fieldKey}_${index}_name`]}
                            placeholder="Nhập tên"
                            onChange={(e) => editProps(e, index, "name")}
                        />
                        <ValidatedInput
                            label="Giá thêm (đ)"
                            name={`${fieldKey}_${index}_price`}
                            value={item.price}
                            inputRef={registerRef(`${fieldKey}_${index}_price`)}
                            error={errors[`${fieldKey}_${index}_price`]}
                            placeholder="Nhập giá"
                            type="number"
                            onChange={(e) => editProps(e, index, "price")}
                        />
                        <ConfirmPopup onDelete={() => removeProps(index)} label='Xóa' classNameButton='px-2 mt-5  w-[50px] absolute top-[30px] right-20'>
                            <Trash />
                        </ConfirmPopup>
                    </div>
                ))}

                <button type="button" onClick={addProps} className="flex items-center mt-3 bg-white">
                    <Plus className="w-4 h-4" />
                    <span className="ml-1">{addLabel}</span>
                </button>
            </div>
        </div>
    );

}
