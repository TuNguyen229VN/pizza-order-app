import ValidatedInput from '@/components/input/ValidatedInput';
import React from 'react'

export default function CheckoutInfo({ infoProps, setInfoProps, errors, registerRef, clearError }) {
    const { name, phone, email } = infoProps;
    return (
        <div className='px-4 py-4 mt-6 border rounded-2xl'>
            <div className='flex justify-between'>
                <p className='md:text-2xl md:leading-[30px] font-semibold'>Người đặt hàng</p>
            </div>
            <div className='mt-5 md:mt-9'>
                <ValidatedInput
                    label="Họ tên"
                    id="name"
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
                    id="phone"
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
                    id="email"
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
