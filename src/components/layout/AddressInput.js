import React from 'react'
import ValidatedInput from '../input/ValidatedInput';

export default function AddressInput({ infoProps, setInfoProps, errors, registerRef, clearError, disabled = false }) {
    const { phone, streetAddress, postalCode, city, country } = infoProps;
    return (
        <>
            <ValidatedInput
                label="Số điện thoại"
                name="phone"
                value={phone || ""}
                inputRef={registerRef("phone")}
                error={errors.phone}
                placeholder="Nhập số điện thoại của bạn"
                onChange={(e) => {
                    setInfoProps('phone', e.target.value);
                    clearError("phone");
                }}
            />
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
        </>
    )
}
