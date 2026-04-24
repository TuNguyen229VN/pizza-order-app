import React, { useState } from 'react'
import Trash from '../icons/Trash'
import Plus from '../icons/Plus'
import ChevronDown from '../icons/ChevronDown';
import ChevronUp from '../icons/ChevronUp';

export default function MenuItemPriceProps({ name, addLabel, props, setProps }) {

    const [isOpen, setIsOpen] = useState(false)

    const addProps = () => {
        setProps(oldProps => {
            return [...oldProps, { name: "", price: 0 }];
        });
    }

    const editProps = (e, index, prop) => {
        const newValue = e.target.value;
        setProps(prevSized => {
            const newSized = [...prevSized];
            newSized[index][prop] = prop = newValue;
            return newSized;
        })
    }

    const removeProps = (indexToRemove) => {
        setProps(prev => prev.filter((v, index) => index !== indexToRemove))
    }

    return (
        <div className="p-2 mb-2 bg-gray-200 rounded-md">
            <button className="inline-flex justify-start p-1 border-0" type='button' onClick={() => setIsOpen(prev => !prev)}>{isOpen ? (<ChevronUp />) : (<ChevronDown />)}<span className='text-gray-700'>{name}</span>
                <span>({props?.length})</span></button>
            <div className={isOpen ? "block" : "hidden"}>
                {props?.length > 0 && props.map((size, index) => (
                    <div key={index} className="flex items-end gap-2">
                        <div className="">
                            <label htmlFor="">Size name</label>
                            <input
                                type="text"
                                placeholder="Size name"
                                value={size.name}
                                onChange={(e) => editProps(e, index, "name")}
                            />
                        </div>
                        <div className="">
                            <label htmlFor="">Extra price</label>
                            <input
                                type="text"
                                placeholder="Extra price"
                                value={size.price}
                                onChange={(e) => editProps(e, index, "price")}
                            />
                        </div>
                        <div className="">
                            <button className='px-2 mb-2 bg-white' type='button' onClick={() => removeProps(index)}><Trash /></button>
                        </div>
                    </div>
                ))}
                <button type='button' onClick={addProps} className='items-center bg-white'><Plus className='w-4 h-4' /> <span>{addLabel}</span></button></div>

        </div>
    )
}
