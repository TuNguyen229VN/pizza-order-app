import PaymentMethodSelect from '@/components/input/PaymentMethodSelect'
import { useTranslations } from 'next-intl';
import React from 'react'

export default function CheckoutMethod({ paymentMethod, setPaymentMethod, registerRef, errors }) {
    const sTrans = useTranslations("System");
    return (
        <div className='px-4 py-4 mt-6 border rounded-2xl'ref={registerRef("paymentMethod")}>
            <div className='flex justify-between'>
                <p className='hidden md:block md:text-2xl md:leading-[30px] font-semibold'>{sTrans("Phương thức thanh toán")}</p>
            </div>
            {errors.paymentMethod && (
                <span className="my-1 text-xs text-primary">{errors.paymentMethod}</span>
            )}
            <div className='mt-4 md:mt-8' >

                <PaymentMethodSelect value={paymentMethod} onChange={setPaymentMethod} />
            </div>
        </div>
    )
}
