import Image from 'next/image';
import React, { useState } from 'react'
import { cartProductPrice } from '../../components/AppContext';
import TrashCircel from '@/components/icons/TrashCircel';
import CartProductDetail from './CartProductDetail';

export default function CartProduct({ index, product, onRemove, showEdit = false }) {
  const [showPopup, setShowPopup] = useState(false)
  return (
    <div className="flex justify-between gap-4 py-4">
      <div className='flex gap-4'>
        <div className='w-[82px] h-[96px] overflow-hidden'>
          <Image width={240} height={240} src={product.image} alt={product.name} className='object-cover object-center w-full h-full' />
        </div>
        <div className='w-[350px] break-words'>
          <h4 className='font-medium'>{product.name}</h4>
          {product.size && (
            <div className="mt-1 text-secondary">
              Cỡ: <span>{product.size.name}</span>
            </div>
          )}
          {product.extras?.length > 0 && (
            <div className="mt-1 text-secondary">
              Topping thêm:
              {product.extras.map((extra, index) => (
                <span key={extra.name}> {extra.name}{index !== product.extras.length - 1 && ","}</span>
              ))}
            </div>
          )}
          {product.noteOrder && <div className='text-sm text-secondary'>
            Ghi chú: <p>{product.noteOrder}</p>
          </div>}

          {showEdit && (
            <>
              <div className='mt-1 cursor-pointer text-primary' onClick={() => setShowPopup(true)}>Chỉnh sửa
              </div>
              <CartProductDetail menuItem={product} showPopup={showPopup} setShowPopup={setShowPopup} />
            </>
          )}
        </div>
      </div>
      <div className='text-lg font-medium text-center'>
        {product.quantity}
      </div>
      <div className='flex items-start text-lg font-medium w-[200px] justify-end gap-5'>
        <p>{cartProductPrice(product).toLocaleString('vi-VN')} <span className='underline'>đ</span></p>
        {!!onRemove && (
          <div className="">
            <button
              type="button"
              onClick={() => onRemove(index)}
            >
              <TrashCircel />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
