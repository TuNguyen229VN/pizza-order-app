import React from 'react'

export default function CheckoutInfo({ infoProps, setInfoProps, }) {
    const { name, phone, email } = infoProps;
    return (
        <div className='px-4 py-4 mt-6 border rounded-2xl'>
            <div className='flex justify-between'>
                <p className='text-2xl leading-[30px] font-semibold'>Người đặt hàng</p>
            </div>
            <div className='mt-9'>
                <p className='my-2 text-sm font-medium'>Họ và tên</p>
                <input
                    className='w-full py-3 pl-5 pr-8 border rounded-md outline-none focus:border-black'
                    type="text" placeholder="Nhập đầy đủ họ tên của bạn"
                    value={name || ''} onChange={ev => setInfoProps('name', ev.target.value)}
                />
                <p className='my-2 text-sm font-medium'>Số điện thoại</p>
                <input
                    type="tel" placeholder="Nhập số điện thoại của bạn"
                    value={phone || ''} onChange={ev => setInfoProps('phone', ev.target.value)}
                    className='w-full py-3 pl-5 pr-8 border rounded-md outline-none focus:border-black'
                />
                <p className='my-2 text-sm font-medium'>Email</p>
                <input
                    className='w-full py-3 pl-5 pr-8 border rounded-md outline-none focus:border-black'
                    type="text" placeholder="Nhập email của bạn"
                    value={email || ''} onChange={ev => setInfoProps('email', ev.target.value)}
                />
            </div>

        </div>
    )
}
