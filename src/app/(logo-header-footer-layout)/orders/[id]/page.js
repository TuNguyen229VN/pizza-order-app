"use client"
import { CartContext, cartProductPrice } from '@/components/AppContext';
import AddressInput from '@/components/layout/AddressInput';
import SectionHeader from '@/components/layout/SectionHeader';
import CartProduct from '@/modules/cart/CartProduct';
import { API_ORDERS } from '@/constant/constant';
import { useParams, useSearchParams } from 'next/navigation';
import React, { useContext, useEffect, useState } from 'react'
import Image from 'next/image';
import Link from 'next/link';
import { HOME_ROUTE, ORDERS_ROUTE } from '@/constant/routesApp';
import { totalQuantity } from '@/libs/totalQuantity';
import { dbTimeForHuman } from '@/libs/datetime';
import CartSubtotal from '@/modules/cart/CartSubtotal';
import UseProfile from '@/components/UseProfile';
import HeaderCart from '@/modules/cart/HeaderCart';

export default function OrderPage() {
    const { clearCart } = useContext(CartContext);
    const [order, setOrder] = useState();
    const [loadingOrder, setLoadingOrder] = useState(true);
    const { loading, data: profile } = UseProfile();
    const { id } = useParams();
    const searchParams = useSearchParams();

    const from = searchParams.get("from");
    useEffect(() => {
        if (typeof window.console !== "undefined") {
            if (window.location.href.includes('clear-cart=1')) {
                clearCart();
            }
        }
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

    let subtotal = 0;
    if (order?.cartProducts) {
        for (const product of order?.cartProducts) {
            subtotal += cartProductPrice(product);
        }
    }

    const isOwnOrder = profile.email === order?.userEmail;
    const showAdminLayout = profile.admin && !isOwnOrder;
    return (
        <section className="max-w-3xl pb-6 mx-auto">
            {loadingOrder && (
                <div>Đang tải đơn hàng...</div>
            )}
            {order && <>
                {from === "orders" &&
                    <HeaderCart text="Đơn hàng" />

                }
                <div className="text-center">
                    <div className="font-bold text-3xl leading-[38px]">
                        {!showAdminLayout && from !== "orders" && <>
                            <p>Cảm ơn bạn {order?.userName} !</p>
                            <p>Đơn hàng của bạn đã được đặt thành công</p>
                        </>}
                        <p>#{order?._id}</p>
                        <div></div>
                    </div>
                    {!showAdminLayout && from !== "orders" && <>
                        <div className='my-6 w-[320px] h-[320px] mx-auto'>
                            <Image src={"/images/thankyour.png"} alt='Thankyou' width={200} height={200} className='object-cover object-center w-full h-full' />
                        </div>
                        <Link href={HOME_ROUTE} className='inline-block w-full px-6 py-3 font-medium duration-300 border-2 rounded-lg border-primary text-primary hover:bg-red-100 hover:scale-105'>Đi đến trang chính</Link>
                    </>}
                </div>

                <div className='grid grid-cols-2 gap-6 mt-6'>
                    <div className='p-6 border rounded-lg'>
                        <h4 className='mb-6 text-2xl font-semibold'>Giao đến</h4>
                        <p><span className='font-medium'>Khách hàng:</span> {order?.userName}</p>
                        <p> {order?.phone}</p>
                        <p> {order?.streetAddress}, {order?.country}, {order?.city} </p>
                    </div>
                    <div className='p-6 border rounded-lg'>
                        <h4 className='mb-6 text-2xl font-semibold'>Phương thức thanh toán</h4>
                        <p>Thanh toán STRIPE</p>
                        <p className={`mt-4 text-center rounded-lg w-[150px] p-2 line-clamp-1 break-all overflow-hidden font-medium ${order?.paid ? 'text-green-700 bg-green-200' : 'text-red-500 bg-red-200'}`} title={order?.paid ? 'Đã thanh toán' : 'Chưa thanh toán'}>
                            {order?.paid ? 'Đã thanh toán' : 'Chưa thanh toán'}

                        </p>
                    </div>
                </div>
                <div className='grid grid-cols-2 p-6 mt-6 border rounded-lg'>
                    <p className='font-semibold'>Có {totalQuantity(order?.cartProducts)} sản phẩm trong giỏ hàng của bạn</p>
                    <div className='col-span-2'>
                        <p className='text-secondary'>{dbTimeForHuman(order?.createdAt)}</p>
                        <div>
                            {order.cartProducts.map(product => (
                                <CartProduct key={product._id} product={product} />
                            ))}
                        </div>
                    </div>
                    <div></div>
                    <CartSubtotal subtotal={subtotal} className={"border-none"} />
                </div>

                {!showAdminLayout && from !== "orders" && <div className='p-6 mt-6 border rounded-lg'>
                    <p className='mb-6 text-2xl font-semibold'>Có câu hỏi về đơn hàng của bạn?</p>
                    <p>
                        Gọi đến Tổng đài Dịch vụ Khách hàng: <span className='text-primary'>19001822</span>
                    </p>
                    <p> Xin lưu ý: đơn hàng của bạn không thể được thay đổi hoặc hủy từ trang web. Vui lòng gọi cho chúng tôi. Nhân viên của chúng tôi có thể gọi cho bạn nếu cần làm rõ về đơn hàng của bạn.</p>
                </div>}
            </>}
        </section>
    );
}
