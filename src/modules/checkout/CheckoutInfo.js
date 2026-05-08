import ValidatedInput from '@/components/input/ValidatedInput';
import React from 'react'

export default function CheckoutInfo({ infoProps, setInfoProps, errors, registerRef, clearError }) {
    const { name, phone, email } = infoProps;
    return (
        <div className='px-4 py-4 mt-6 border rounded-2xl'>
            <div className='flex justify-between'>
                <p className='text-2xl leading-[30px] font-semibold'>Người đặt hàng</p>
            </div>
            <div className='mt-9'>
                <ValidatedInput
                    label="Họ tên"
                    name="name"
                    value={name || ""}
                    inputRef={registerRef("name")}
                    error={errors.name}
                    placeholder="Nhập đầy đủ họ tên của bạn"
                    onChange={(e) => {
                        setInfoProps("name", e.target.value);
                        clearError("name");
                    }}
                />
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
                    label="Email"
                    name="email"
                    value={email || ""}
                    inputRef={registerRef("email")}
                    error={errors.email}
                    placeholder="Nhập email của bạn"
                    onChange={(e) => {
                        setInfoProps('email', e.target.value);
                        clearError("email");
                    }}
                />
            </div>

        </div>
    )
}
