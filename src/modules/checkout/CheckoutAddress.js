import ChevronRight from '@/components/icons/ChevronRight';
import ValidatedInput from '@/components/input/ValidatedInput';
import { useDelivery } from '@/context/DeliveryContext';
import React, { useState } from 'react'
import DeliveryPickupModal from '../DeliveryPickupModal';
import CloseIcon from '@/components/icons/CloseIcon';

export default function CheckoutAddress({ infoProps, setInfoProps, errors, registerRef, clearError, open, setOpen, noteDelivery, setNoteDelivery }) {
    const { streetAddress, city, country } = infoProps;
    const { deliveryInfo } = useDelivery();

    return (
        <div className='px-4 py-4 border rounded-2xl'>
            <div className='flex justify-between cursor-pointer' onClick={() => setOpen(true)}>
                <p className='text-2xl leading-[30px] font-semibold'>{deliveryInfo?.mode === "delivery" ? "Giao đến" : "Mua mang về tại"}</p>
                <ChevronRight />
            </div>
            <DeliveryPickupModal
                isOpen={open}
                onClose={() => setOpen(false)}
            />
            <div className='mt-9'>
                <p className='mb-2 text-lg font-medium'>{deliveryInfo?.address || deliveryInfo?.store.name || ""}</p>
                {deliveryInfo?.store&&<p className='text-lg '>{deliveryInfo?.store?.address}</p>}
                <div className="flex items-center justify-between my-4">
                    <h3 className="text-sm font-medium">Ghi chú (tùy chọn)</h3>
                    <span className="text-sm whitespace-nowrap">{noteDelivery?.length}/200</span>
                </div>
                <ValidatedInput
                    name="noteDelivery"
                    maxLength={200}
                    value={noteDelivery || ""}
                    inputRef={registerRef("noteDelivery")}
                    error={errors.noteDelivery}
                    placeholder="Ghi chú cho giao hàng, ví dụ: tầng phòng..."
                    onChange={(e) => {
                        setNoteDelivery(e.target.value);
                        clearError("noteDelivery");
                    }}
                />
            </div>

        </div>
    )
}
