"use client"
import { CartContext, cartProductPrice, totalCartPrice } from '@/components/AppContext';
import AddressInput from '@/components/layout/AddressInput';
import SectionHeader from '@/components/layout/SectionHeader';
import CartProduct from '@/modules/cart/CartProduct';
import { API_ORDERS, CANCEL_WINDOW_MINUTES, METHODS, ORDER_STATUS_FLOW, ORDER_STATUS_LABELS } from '@/constant/constant';
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
import OrderStatusBadge from '@/modules/orders/OrderStatusBadge';
import { pusherClient } from '@/libs/pusherClient';

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
    const [updatingStatus, setUpdatingStatus] = useState(false);
    // refund
    const [cancelling, setCancelling] = useState(false);
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 30000);
        return () => clearInterval(interval);
    }, []);

    // 
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
        if (!order?._id) return;

        const channel = pusherClient.subscribe(`order-${order._id}`);

        function handleOrderUpdated(data) {
            setOrder(prev => prev ? { ...prev, status: data.status, paid: data.paid } : prev);
        }

        channel.bind("order-updated", handleOrderUpdated);

        return () => {
            channel.unbind("order-updated", handleOrderUpdated);
            pusherClient.unsubscribe(`order-${order._id}`);
        };
    }, [order?._id]);

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

    async function handleCancelOrder() {
        setCancelling(true);
        try {
            const res = await fetch(`/api/orders/${order._id}/cancel`, { method: "POST" });
            const data = await res.json();
            if (res.ok) {
                setOrder(prev => ({ ...prev, status: "cancelled" }));
                toast.success(sTrans("Đã hủy đơn hàng"));
            } else {
                toast.error(getLabel(sTrans, data?.message) || sTrans("Hủy đơn thất bại"));
            }
        } catch {
            toast.error(sTrans("Lỗi kết nối"));
        } finally {
            setCancelling(false);
        }
    }

    async function handleUpdateStatus(nextStatus) {
        setUpdatingStatus(true);
        try {
            const res = await fetch(`/api/orders/${order._id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: nextStatus }),
            });
            const data = await res.json();
            if (res.ok) {
                setOrder(data);
                toast.success(sTrans("Cập nhật trạng thái thành công"));
            } else {
                toast.error(getLabel(sTrans, data?.message) || sTrans("Cập nhật thất bại"));
            }
        } catch {
            toast.error(sTrans("Lỗi kết nối"));
        } finally {
            setUpdatingStatus(false);
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
    const showAdminForHandleLayout = profile?.admin;

    // ================
    const minutesElapsed = order?.createdAt ? (now - new Date(order.createdAt).getTime()) / 60000 : Infinity;
    const canCancel = order
        && ["pending", "confirmed"].includes(order.status)
        && minutesElapsed <= CANCEL_WINDOW_MINUTES;

    const mode = order?.deliveryInfo?.mode === "delivery" ? "delivery" : "pickup";
    const flow = ORDER_STATUS_FLOW[mode];
    const currentIdx = order ? flow.indexOf(order.status) : -1;
    const nextStatus = currentIdx >= 0 && currentIdx < flow.length - 1 ? flow[currentIdx + 1] : null;
    const canAdvanceStatus = showAdminForHandleLayout && nextStatus && order?.status !== "cancelled";
    // ================
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

                        {showAdminForHandleLayout && order?.paymentMethod === "cod" && !order?.paid && (
                            <ConfirmPopup onDelete={handleConfirmCodPayment} disabled={updatingPaid} label={sTrans("CONFIRM_PAYMENT_COD_LABEL")} classNameButton='w-full py-3 mt-4 text-sm font-medium text-white duration-200 bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed'>
                                {updatingPaid ? `${sTrans("Đang cập nhật")}...` : sTrans("COFIRM_PAYMENT_COD")}
                            </ConfirmPopup>
                        )}

                        {/* ================refund */}
                        {/* {order?.status === "cancelled" && (
                            <p className='mt-4 text-center rounded-lg w-[150px] p-2 font-medium text-gray-700 bg-gray-200'>
                                {sTrans("Đã hủy")}
                            </p>
                        )} */}



                    </div>
                </div>
                {/* ========================= */}
                {/* {showAdminForHandleLayout && ( */}
                <div className='p-6 mt-4 border rounded-lg md:mt-6'>
                    <h4 className='mb-4 font-semibold md:mb-6 md:text-2xl'>{sTrans("Trạng thái đơn hàng")}</h4>
                    <OrderStatusBadge status={order?.status} className="w-full mb-4" />
                    {!showAdminLayout && canCancel && (
                        <ConfirmPopup
                            onDelete={handleCancelOrder}
                            disabled={cancelling}
                            label={sTrans("CONFIRM_CANCEL_ORDER_LABEL")}
                            classNameButton='w-full py-3 text-sm font-medium text-white duration-200 bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            {cancelling ? `${sTrans("Đang hủy")}...` : sTrans("Hủy đơn hàng")}
                        </ConfirmPopup>
                    )}
                    {canAdvanceStatus && (
                        <ConfirmPopup
                            onDelete={() => handleUpdateStatus(nextStatus)}
                            disabled={updatingStatus}
                            label={`${sTrans("Xác nhận chuyển sang")}: ${sTrans(ORDER_STATUS_LABELS[nextStatus])}`}
                            classNameButton='w-full py-3 text-sm duration-200 border-2 rounded-lg border-primary text-primary hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            {updatingStatus
                                ? `${sTrans("Đang cập nhật")}...`
                                : `${sTrans("Chuyển sang")}: ${sTrans(ORDER_STATUS_LABELS[nextStatus])}`}
                        </ConfirmPopup>
                    )}

                    {/* {!canAdvanceStatus && order?.status !== "cancelled" && (
                        <p className='text-sm italic text-secondary'>{sTrans("Đơn hàng đã hoàn thành")}</p>
                    )} */}
                </div>
                {/* )} */}

                {/* ==================== */}
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
