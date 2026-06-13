"use client"
import { CartContext, cartProductPrice, totalCartPrice } from '@/components/AppContext';
import ButtonPrimary from '@/components/buttons/ButtonPrimary';
import ChevronRight from '@/components/icons/ChevronRight';
import AddressInput from '@/components/layout/AddressInput'
import UseProfile from '@/components/UseProfile';
import { API_CHECKOUT } from '@/constant/constant';
import { CART_ROUTE } from '@/constant/routesApp';
import { useDelivery } from '@/context/DeliveryContext';
import { useFormValidate } from '@/hooks/useFormValidate';
import { totalQuantity } from '@/libs/totalQuantity';
import { validators } from '@/libs/validators';
import CartSubtotal from '@/modules/cart/CartSubtotal';
import HeaderCart from '@/modules/cart/HeaderCart';
import CheckAcceptPolicy from '@/modules/checkout/CheckAcceptPolicy';
import CheckoutAddress from '@/modules/checkout/CheckoutAddress';
import CheckoutInfo from '@/modules/checkout/CheckoutInfo';
import CheckoutMethod from '@/modules/checkout/CheckoutMethod';
import Link from 'next/link';
import React, { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast';

export default function CheckoutPage() {
    const { errors, setErrors, registerRef, handleValidate, clearError } = useFormValidate();
    const [infoProfileCheckout, setInfoProfileCheckout] = useState({});
    const [checked, setChecked] = useState(false);
    const [noteDelivery, setNoteDelivery] = useState("")
    const [legit, setLegit] = useState(false)
    const { data: profileData } = UseProfile();

    const { cartProducts } = useContext(CartContext);
    const { deliveryInfo, openDeliveryModal } = useDelivery();
    const [paymentMethod, setPaymentMethod] = useState();
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
        if (!deliveryInfo) {
            openDeliveryModal();
            return;
        }
        const isValid = handleValidate({
            name: {
                value: infoProfileCheckout.name,
                rules: [validators.required("họ và tên"), validators.minLength(2), validators.maxLength(200)],
            },
            email: {
                value: infoProfileCheckout.email,
                rules: [validators.required("email"), validators.email],
            },
            phone: {
                value: infoProfileCheckout.phone,
                rules: [validators.required("số điện thoại"), validators.phone],
            },
            noteDelivery: {
                value: noteDelivery,
                rules: [validators.maxLength(200)]
            },
            paymentMethod: {
                value: paymentMethod,
                rules: [validators.required("phương thức thanh toán")],
            }
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
                    deliveryInfo,
                    noteDelivery,
                    paymentMethod,
                }),
            }).then(async (response) => {
                if (response.ok) {
                    resolve();
                    const { redirectUrl } = await response.json();
                    window.location = redirectUrl;
                } else {
                    const errorData = await response.json().catch(() => null);
                    reject(errorData);
                }
            });
        });

        await toast.promise(promise, {
            loading: 'Đang xử lý...',
            success: 'Đang chuyển hướng...',
            error: (err) => {
                // Xử lý lỗi validation từ server
                if (err?.errors && typeof err.errors === 'object') {
                    // ✅ Dùng setErrors để trigger re-render
                    setErrors(prev => ({
                        ...prev,
                        ...err.errors // merge lỗi server vào errors hiện tại
                    }));
                    return err?.message || "Dữ liệu không hợp lệ";
                }
                return err?.message || "Cập nhật thất bại";
            },
        });
    }

    let subtotal = 0;
    for (const p of cartProducts) {
        subtotal += cartProductPrice(p);
    }


    return (
        <section>
            <HeaderCart text='Thanh toán' urlLink={CART_ROUTE} />
            <div className="grid gap-4 md:mt-8 md:gap-8 md:grid-cols-3">
                <div className='md:col-span-2'>
                    <form id='checkout-form' onSubmit={proceedToCheckout}>
                        <CheckoutAddress infoProps={infoProfileCheckout}
                            setInfoProps={handleInfoChange} errors={errors} registerRef={registerRef}
                            clearError={clearError} noteDelivery={noteDelivery} setNoteDelivery={setNoteDelivery}></CheckoutAddress>
                        <CheckoutInfo infoProps={infoProfileCheckout}
                            setInfoProps={handleInfoChange} errors={errors} registerRef={registerRef}
                            clearError={clearError} ></CheckoutInfo>
                        <CheckoutMethod paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} errors={errors} registerRef={registerRef} />
                    </form>
                </div>
                <div>
                    <CartSubtotal subtotal={totalCartPrice(cartProducts)} deliveryFee={deliveryInfo?.shipFee}>
                        <Link href={CART_ROUTE} className='flex items-center justify-between '>
                            <p className='mb-1 font-semibold md:text-2xl'>Giỏ hàng của tôi</p>
                            <ChevronRight className='w-4 h-4 md:w-6 md:h-6' />
                        </Link>
                        <p>Có {totalQuantity(cartProducts)} sản phẩm trong giỏ hàng của bạn</p>
                        <div className='w-full h-[1px] bg-gray-200 my-3 md:my-4'></div>
                    </CartSubtotal>
                    <CheckAcceptPolicy checked={checked} setChecked={setChecked} legit={legit} />
                    <div className='px-4 md:px-0'>
                        <ButtonPrimary form="checkout-form" type="submit" className={"mt-4 md:mt-6"} disabled={!cartProducts?.length}>
                            Đặt hàng
                        </ButtonPrimary>
                    </div>

                </div>
            </div>
        </section>
    )
}
