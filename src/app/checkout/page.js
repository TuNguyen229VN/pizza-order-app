"use client"
import { CartContext, cartProductPrice } from '@/components/AppContext';
import ButtonPrimary from '@/components/buttons/ButtonPrimary';
import ChevronRight from '@/components/icons/ChevronRight';
import AddressInput from '@/components/layout/AddressInput'
import UseProfile from '@/components/UseProfile';
import { CART_ROUTE } from '@/constant/routesApp';
import { totalQuantity } from '@/libs/totalQuantity';
import CartSubtotal from '@/modules/cart/CartSubtotal';
import HeaderCart from '@/modules/cart/HeaderCart';
import Link from 'next/link';
import React, { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast';

export default function CheckoutPage() {
    const [address, setAddress] = useState({});
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
        if (profileData?.city) {
            const { phone, streetAddress, city, postalCode, country } = profileData;
            const addressFromProfile = {
                phone,
                streetAddress,
                city,
                postalCode,
                country
            };
            setAddress(addressFromProfile);
        }
    }, [profileData]);

    function handleAddressChange(propName, value) {
        setAddress(prevAddress => ({ ...prevAddress, [propName]: value }));
    }

    async function proceedToCheckout(ev) {
        ev.preventDefault();
        // address and shopping cart products
        const promise = new Promise((resolve, reject) => {
            fetch(API_CHECKOUT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    address,
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
        <section className="mt-8">
            <HeaderCart text='Thanh toán' urlLink={CART_ROUTE} />
            <div className="grid grid-cols-3 gap-8 mt-8">
                <div className='col-span-2'>
                    <form onSubmit={proceedToCheckout}>
                        <AddressInput
                            addressProps={address}
                            setAddressProp={handleAddressChange}
                        />
                        <button type="submit">Pay ${subtotal + 5000}</button>
                    </form>
                </div>
                <div>
                    <CartSubtotal subtotal={subtotal}>
                        <Link href={CART_ROUTE} className='flex items-center justify-between '>
                            <p className='mb-1 text-2xl font-semibold'>Giỏ hàng của tôi</p>
                            <ChevronRight/>                            
                        </Link>
                        <p>Có {totalQuantity(cartProducts)} sản phẩm trong giỏ hàng của bạn</p>
                        <div className='w-full h-[1px] bg-gray-200 my-4'></div>
                    </CartSubtotal>
                    <ButtonPrimary className={"mt-6"}>
                        Đặt hàng
                    </ButtonPrimary>

                </div>
            </div>
        </section>
    )
}
