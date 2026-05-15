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
                <p className='mb-2 text-lg font-medium'>{deliveryInfo?.address || deliveryInfo?.store.address || ""}</p>
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
                {/* <ValidatedInput
                    label="Ghi chú"
                    name="streetAddress"
                    value={streetAddress || ""}
                    inputRef={registerRef("streetAddress")}
                    error={errors.streetAddress}
                    placeholder="Ghi chú cho giao hàng, ví dụ: tầng phòng..."
                    onChange={(e) => {
                        setInfoProps('streetAddress', e.target.value);
                        clearError("streetAddress");
                    }}
                /> */}
                {/*   <ValidatedInput
                    label="Quận"
                    name="country"
                    value={country || ""}
                    inputRef={registerRef("country")}
                    error={errors.country}
                    placeholder="Nhập tên quận của bạn"
                    onChange={(e) => {
                        setInfoProps('country', e.target.value);
                        clearError("country");
                    }}
                />
                <ValidatedInput
                    label="Thành phố"
                    name="city"
                    value={city || ""}
                    inputRef={registerRef("city")}
                    error={errors.city}
                    placeholder="Nhập tên thành phố của bạn"
                    onChange={(e) => {
                        setInfoProps('city', e.target.value);
                        clearError("city");
                    }}
                /> */}
            </div>

        </div>
    )
}
