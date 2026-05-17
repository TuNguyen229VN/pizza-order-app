import React, { forwardRef } from 'react'
import FlyingButton from '../buttons/FlyingButton';
import ButtonAdd from '../buttons/ButtonAdd';
import { useDelivery } from '@/context/DeliveryContext';

const AddToCartButton = forwardRef(function AddToCartButton({
    hasSizesOrExtras, onClick, onAddToCart, basePrice, image, className
}, ref) {
    const { deliveryInfo } = useDelivery()

    if (!hasSizesOrExtras) {
        return (
            <div className="mt-4 flying-button-parent">
                <FlyingButton
                    ref={ref}
                    targetTop={'6%'}
                    targetLeft={'80%'}
                    src={image}
                    onClick={onAddToCart}
                >
                    <ButtonAdd onClick={(e) => {
                        if (!deliveryInfo) {
                            e.stopPropagation();
                            onClick(); 
                            return;
                        }
                    }} className="add-to-cart-zone" />
                </FlyingButton>
            </div>
        );
    }
    return (
        <ButtonAdd onClick={onClick} className="add-to-cart-zone" />
    );
});

export default AddToCartButton;