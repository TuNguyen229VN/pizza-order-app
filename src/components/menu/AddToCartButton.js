import React from 'react'
import FlyingButton from '../buttons/FlyingButton';
import ButtonAdd from '../buttons/ButtonAdd';


export default function AddToCartButton({
    hasSizesOrExtras, onClick, basePrice, image,className
}) {
    if (!hasSizesOrExtras) {
        return (
            <div className="mt-4 flying-button-parent">
                <FlyingButton
                    targetTop={'6%'}
                    targetLeft={'80%'}
                    src={image}>
                    <ButtonAdd onClick={onClick} className="add-to-cart-zone"/>
                </FlyingButton>
            </div>
        );
    }
    return (
        <ButtonAdd onClick={onClick} className="add-to-cart-zone"/>
    );
}
