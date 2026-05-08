"use client"
import { CartContext, cartProductPrice } from '@/components/AppContext';
import ButtonPrimary from '@/components/buttons/ButtonPrimary';
import ChevronRight from '@/components/icons/ChevronRight';
import AddressInput from '@/components/layout/AddressInput'
import UseProfile from '@/components/UseProfile';
import { API_CHECKOUT } from '@/constant/constant';
import { CART_ROUTE } from '@/constant/routesApp';
import { useFormValidate } from '@/hooks/useFormValidate';
import { totalQuantity } from '@/libs/totalQuantity';
import { validators } from '@/libs/validators';
import CartSubtotal from '@/modules/cart/CartSubtotal';
import HeaderCart from '@/modules/cart/HeaderCart';
import CheckAcceptPolicy from '@/modules/checkout/CheckAcceptPolicy';
import CheckoutAddress from '@/modules/checkout/CheckoutAddress';
import CheckoutInfo from '@/modules/checkout/CheckoutInfo';
import Link from 'next/link';
import React, { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast';

export default function CheckoutPage() {
    const { errors, registerRef, handleValidate, clearError } = useFormValidate();
    const [infoProfileCheckout, setInfoProfileCheckout] = useState({});
    const [checked, setChecked] = useState(false);
    const [legit, setLegit] = useState(false)
    const { data: profileData } = UseProfile();

    const { cartProducts } = useContext(CartContext);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (window.location.href.includes('canceled=1')) {
                toast.error('Payment failed 😔');
            }
        }
    }, []);

    useEffect(() => {
        if (profileData) {
            const { name, email, phone, streetAddress, city, country } = profileData;
            const infoFromProfile = {
                name,
                email,
                phone,
                streetAddress,
                city,
                country,
            };
            setInfoProfileCheckout(infoFromProfile);
        }
    }, [profileData]);

    function handleInfoChange(propName, value) {
        setInfoProfileCheckout(prevInfo => ({ ...prevInfo, [propName]: value }));
    }

    async function proceedToCheckout(ev) {
        ev.preventDefault();
        // address and shopping cart products
        const isValid = handleValidate({
            name: {
                value: infoProfileCheckout.name,
                rules: [validators.required("họ và tên"), validators.minLength(2),validators.maxLength(200)],
            },
            email: {
                value: infoProfileCheckout.email,
                rules: [validators.required("email"), validators.email],
            },
            phone: {
                value: infoProfileCheckout.phone,
                rules: [validators.required("số điện thoại"), validators.phone],
            },
            streetAddress: {
                value: infoProfileCheckout.streetAddress,
                rules: [validators.required("địa chỉ nhà"), validators.minLength(2),validators.maxLength(200)],
            },
            city: {
                value: infoProfileCheckout.city,
                rules: [validators.required("thành phố"), validators.minLength(2),validators.maxLength(200)],
            },
            country: {
                value: infoProfileCheckout.country,
                rules: [validators.required("quận"), validators.minLength(2),validators.maxLength(200)],
            },
        });

        if (!isValid) return;

        setLegit(true);
        if (!checked) return
        const promise = new Promise((resolve, reject) => {
            fetch(API_CHECKOUT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    infoProfileCheckout,
                    cartProducts,
                }),
            }).then(async (response) => {
                if (response.ok) {
                    resolve();
                    window.location = await response.json();
                } else {
                    reject();
                }
            });
        });

        await toast.promise(promise, {
            loading: 'Preparing your order...',
            success: 'Redirecting to payment...',
            error: 'Something went wrong... Please try again later',
        })
    }

    let subtotal = 0;
    for (const p of cartProducts) {
        subtotal += cartProductPrice(p);
    }


    return (
        <section>
            <HeaderCart text='Thanh toán' urlLink={CART_ROUTE} />
            <div className="grid grid-cols-3 gap-8 mt-8">
                <div className='col-span-2'>
                    <form id='checkout-form' onSubmit={proceedToCheckout}>
                        <CheckoutAddress infoProps={infoProfileCheckout}
                            setInfoProps={handleInfoChange} errors={errors} registerRef={registerRef}
                            clearError={clearError}></CheckoutAddress>
                        <CheckoutInfo infoProps={infoProfileCheckout}
                            setInfoProps={handleInfoChange} errors={errors} registerRef={registerRef}
                            clearError={clearError} ></CheckoutInfo>
                    </form>
                </div>
                <div>
                    <CartSubtotal subtotal={subtotal}>
                        <Link href={CART_ROUTE} className='flex items-center justify-between '>
                            <p className='mb-1 text-2xl font-semibold'>Giỏ hàng của tôi</p>
                            <ChevronRight />
                        </Link>
                        <p>Có {totalQuantity(cartProducts)} sản phẩm trong giỏ hàng của bạn</p>
                        <div className='w-full h-[1px] bg-gray-200 my-4'></div>
                    </CartSubtotal>
                    <CheckAcceptPolicy checked={checked} setChecked={setChecked} legit={legit} />
                    <ButtonPrimary form="checkout-form" type="submit" className={"mt-6"} disabled={!cartProducts?.length}>
                        Đặt hàng
                    </ButtonPrimary>

                </div>
            </div>
        </section>
    )
}
