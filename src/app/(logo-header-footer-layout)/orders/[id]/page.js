"use client"
import { CartContext, cartProductPrice, totalCartPrice } from '@/components/AppContext';
import AddressInput from '@/components/layout/AddressInput';
import SectionHeader from '@/components/layout/SectionHeader';
import CartProduct from '@/modules/cart/CartProduct';
import { API_ORDERS, METHODS } from '@/constant/constant';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import React, { useContext, useEffect, useState } from 'react'
import Image from 'next/image';
import Link from 'next/link';
import { HOME_ROUTE, ORDERS_ROUTE } from '@/constant/routesApp';
import { totalQuantity } from '@/libs/totalQuantity';
import { dbTimeForHuman } from '@/libs/datetime';
import CartSubtotal from '@/modules/cart/CartSubtotal';
import UseProfile from '@/components/UseProfile';
import HeaderCart from '@/modules/cart/HeaderCart';
import toast from 'react-hot-toast';
import ConfirmPopup from '@/components/popup/ConfirmPopup';
import LoadingCat from '@/components/loading/LoadingCat';
import { useTranslations } from 'next-intl';
import { getLabel } from '@/utils/i18n-utils';

export default function OrderPage() {
    const { clearCart } = useContext(CartContext);
    const [order, setOrder] = useState();
    const sTrans = useTranslations("System");
    const cTrans = useTranslations("Cart");
    const hTrans = useTranslations("HomePage");
    const router = useRouter();
    const [loadingOrder, setLoadingOrder] = useState(true);
    const { loading, data: profile } = UseProfile();
    const { id } = useParams();
    const searchParams = useSearchParams();
    const [updatingPaid, setUpdatingPaid] = useState(false);
    const from = searchParams.get("from");
    const status = searchParams.get("status");

    useEffect(() => {
        if (status !== null && status !== "1") {
            router.replace("/cart?canceled=1");
        }
    }, [status]);

    // Nếu đang cần redirect → không render gì hết
    useEffect(() => {
        const status = searchParams.get("status");
        if (status === "1" && order?.app_trans_id) {
            fetch("/api/zalopay/query", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ app_trans_id: order.app_trans_id }),
            });
        }
    }, [order]);
    useEffect(() => {
        if (typeof window.console !== "undefined") {
            const status = searchParams.get("status");
            const isCanceled = status !== null && status !== "1";
            if (!isCanceled && window.location.href.includes('clear-cart=1')) {
                clearCart();
            }
        }
    }, [clearCart]);


    useEffect(() => {
        if (id) {
            setLoadingOrder(true);
            fetch(`${API_ORDERS}?_id=${id}`).then(res => {
                res.json().then(orderData => {
                    setOrder(orderData);
                    setLoadingOrder(false);
                });
            })
        }
    }, []);

    async function handleConfirmCodPayment() {
        setUpdatingPaid(true);
        try {
            const res = await fetch(API_ORDERS, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ _id: order._id }),
            });
            if (res.ok) {
                const updated = await res.json();
                setOrder(updated);
                toast.success(sTrans("Xác nhận thanh toán thành công"));
            } else {
                const err = await res.json();
                toast.error(getLabel(sTrans, err?.message) || (sTrans("Cập nhật thất bại")));
            }
        } catch {
            toast.error(sTrans("Lỗi kết nối"));
        } finally {
            setUpdatingPaid(false);
        }
    }

    let subtotal = 0;
    if (order?.cartProducts) {
        for (const product of order?.cartProducts) {
            subtotal += cartProductPrice(product);
        }
    }
    if (status !== null && status !== "1") return null;
    const isOwnOrder = profile?.email === order?.userEmail;
    const showAdminLayout = profile?.admin && !isOwnOrder;
    if (!loadingOrder && (order?.message || !order)) {
        return (
            <p className="max-w-3xl mx-auto mt-8 text-center md:pb-6">
                {sTrans("Không có đơn hàng")}
            </p>
        );
    }
    return (
        <section className="max-w-3xl mx-auto md:pb-6">
            {loadingOrder && (
                <div className="mb-[100px]">
                <LoadingCat />
                </div>
            )}
            {order && <>
                {from === "orders" &&
                    <HeaderCart text="Đơn hàng" />

                }
                <div className="text-center">
                    <div className="font-bold text-2xl md:text-3xl md:leading-[38px]">
                        {!showAdminLayout && from !== "orders" && <>
                            <p>{sTrans("Cảm ơn bạn")} {order?.userName} !</p>
                            <p>{sTrans("Đơn hàng của bạn đã được đặt thành công")}</p>
                        </>}
                        <p>#{order?._id}</p>
                        {!showAdminLayout && order?.paymentMethod === "cod" && from !== "orders" && <p className='mt-4 text-sm font-normal text-secondary'>{sTrans("CONFIRM_COD_DESC")}</p>}
                    </div>
                    {!showAdminLayout && from !== "orders" && <>
                        <div className='my-6 w-[200px] h-[200px] md:w-[320px] md:h-[320px] mx-auto'>
                            <Image src={"/images/thankyour.png"} alt='Thankyou' width={200} height={200} className='object-cover object-center w-full h-full' />
                        </div>
                        <Link href={HOME_ROUTE} className='inline-block w-full px-6 py-3 font-medium duration-300 border-2 rounded-lg border-primary text-primary hover:bg-red-100 hover:scale-105'>{sTrans("Đi đến trang chính")}</Link>
                    </>}
                </div>

                <div className='grid gap-4 mt-4 md:mt-6 md:gap-6 md:grid-cols-2'>
                    <div className='p-6 border rounded-lg'>
                        <h4 className='mb-4 font-semibold md:mb-6 md:text-2xl'>{order?.deliveryInfo?.mode === "delivery" ? "Giao đến" : "Mua mang về tại"}</h4>
                        <p><span className='font-medium'>{sTrans("Khách hàng")}:</span> {order?.userName}</p>
                        <p> {order?.phone}</p>
                        <p className='font-medium'> {order?.deliveryInfo?.address || order?.deliveryInfo?.store.name} </p>
                        {order?.deliveryInfo?.store && <p>{order?.deliveryInfo?.store.address}</p>}
                        {order?.noteDelivery && <p className='text-sm italic text-secondary'>{sTrans("Ghi chú giao hàng")}: {order?.noteDelivery}</p>}
                    </div>
                    <div className='p-6 border rounded-lg'>
                        <h4 className='mb-4 font-semibold md:mb-6 md:text-2xl'>{sTrans("Phương thức thanh toán")}</h4>
                        <p>
                            {sTrans(METHODS.find(m => m.value === order?.paymentMethod)?.label ?? order?.paymentMethod, { defaultValue: METHODS.find(m => m.value === order?.paymentMethod)?.label ?? order?.paymentMethod })}
                        </p>
                        <p className={`mt-4 text-center rounded-lg w-[150px] p-2 line-clamp-1 break-all overflow-hidden font-medium ${order?.paid ? 'text-green-700 bg-green-200' : 'text-red-500 bg-red-200'}`} title={order?.paid ? sTrans("Đã thanh toán") : sTrans("Chưa thanh toán")}>
                            {order?.paid ? sTrans("Đã thanh toán") : sTrans("Chưa thanh toán")}

                        </p>

                        {profile?.admin && order?.paymentMethod === "cod" && !order?.paid && (
                            <ConfirmPopup onDelete={handleConfirmCodPayment} disabled={updatingPaid} label={sTrans("CONFIRM_PAYMENT_COD_LABEL")} classNameButton='w-full py-3 mt-4 text-sm font-medium text-white duration-200 bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed'>
                                {updatingPaid ? `${sTrans("Đang cập nhật")}...` : sTrans("COFIRM_PAYMENT_COD")}
                            </ConfirmPopup>
                        )}
                    </div>
                </div>
                <div className='grid grid-cols-1 p-6 mt-4 border rounded-lg md:grid-cols-2 md:mt-6'>
                    <p className='font-semibold'>{cTrans("Có")} {totalQuantity(order?.cartProducts)} {cTrans("sản phẩm trong giỏ hàng của bạn")}</p>
                    <div className='md:col-span-2'>
                        <p className='text-secondary'>{dbTimeForHuman(order?.createdAt)}</p>
                        <div>
                            {order?.cartProducts?.map(product => (
                                <CartProduct key={product._id} product={product} />
                            ))}
                        </div>
                    </div>
                    <div></div>
                    <CartSubtotal subtotal={totalCartPrice(order?.cartProducts)} deliveryFee={order?.deliveryInfo?.shipFee} discountAmount={order?.pointDiscount?.discountAmount} discountPercent={order?.pointDiscount?.discountPercent} className={"md:border-none"} />
                </div>

                {!showAdminLayout && from !== "orders" && <div className='p-6 mt-4 border rounded-lg md:mt-6'>
                    <p className='mb-4 font-semibold md:mb-6 md:text-2xl'>{sTrans("Có câu hỏi về đơn hàng của bạn")}?</p>
                    <p>
                        {sTrans("Gọi đến Tổng đài Dịch vụ Khách hàng")}: <span className='text-primary'>19001822</span>
                    </p>
                    <p> {sTrans("ORDER_NOTE_SUPPORT_CUSTOME")}</p>
                </div>}
            </>}
        </section>
    );
}
