import ChevronRight from '@/components/icons/ChevronRight';
import React from 'react'

export default function CheckoutAddress({ infoProps, setInfoProps,}) {
    const { streetAddress, city, country } = infoProps;
    return (
        <div className='px-4 py-4 border rounded-2xl'>
            <div className='flex justify-between'>
                <p className='text-2xl leading-[30px] font-semibold'>Mua mang về tại</p>
                <ChevronRight />
            </div>
            <div className='mt-9'>
                <p className='mb-2 text-lg'>{streetAddress}, {country}, {city}</p>
                <p className='my-2 text-sm font-medium'>Địa chỉ nhà</p>
                <input
                    type="text" placeholder="Nhập đầy đủ địa chỉ nhà của bạn"
                    value={streetAddress || ''} onChange={ev => setInfoProps('streetAddress', ev.target.value)}
                    className='w-full py-3 pl-5 pr-8 border rounded-md outline-none focus:border-black'
                />
                <p className='my-2 text-sm font-medium'>Quận</p>
                <input
                    className='w-full py-3 pl-5 pr-8 border rounded-md outline-none focus:border-black'
                    type="text" placeholder="Nhập tên quận của bạn"
                    value={country || ''} onChange={ev => setInfoProps('country', ev.target.value)}
                />
                <p className='my-2 text-sm font-medium'>Thành phố</p>
                <input
                    className='w-full py-3 pl-5 pr-8 border rounded-md outline-none focus:border-black'
                    type="text" placeholder="Nhập tên thành phố của bạn"
                    value={city || ''} onChange={ev => setInfoProps('city', ev.target.value)}
                />
            </div>

        </div>
    )
}
