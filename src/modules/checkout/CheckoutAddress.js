import ChevronRight from '@/components/icons/ChevronRight';
import ValidatedInput from '@/components/input/ValidatedInput';
import React from 'react'

export default function CheckoutAddress({ infoProps, setInfoProps, errors, registerRef, clearError }) {
    const { streetAddress, city, country } = infoProps;
    return (
        <div className='px-4 py-4 border rounded-2xl'>
            <div className='flex justify-between'>
                <p className='text-2xl leading-[30px] font-semibold'>Mua mang về tại</p>
                <ChevronRight />
            </div>
            <div className='mt-9'>
                <p className='mb-2 text-lg'>{streetAddress}, {country}, {city}</p>
                <ValidatedInput
                    label="Địa chỉ nhà"
                    name="streetAddress"
                    value={streetAddress || ""}
                    inputRef={registerRef("streetAddress")}
                    error={errors.streetAddress}
                    placeholder="Nhập đầy đủ địa chỉ nhà của bạn"
                    onChange={(e) => {
                        setInfoProps('streetAddress', e.target.value);
                        clearError("streetAddress");
                    }}
                />
                <ValidatedInput
                    label="Quận"
                    name="country"
                    value={country || ""}
                    inputRef={registerRef("country")}
                    error={errors.country}
                    placeholder="Nhập tên quận của bạn"
                    onChange={(e) => {
                        setInfoProps('country', e.target.value);
                        clearError("country");
                    }}
                />
                <ValidatedInput
                    label="Thành phố"
                    name="city"
                    value={city || ""}
                    inputRef={registerRef("city")}
                    error={errors.city}
                    placeholder="Nhập tên thành phố của bạn"
                    onChange={(e) => {
                        setInfoProps('city', e.target.value);
                        clearError("city");
                    }}
                />
            </div>

        </div>
    )
}
