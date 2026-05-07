import React from 'react'

export default function AddressInput({ infoProps, setInfoProps, disabled = false }) {
    const { phone, streetAddress, postalCode, city, country } = infoProps;
    return (
        <>
            <label>Phone</label>
            <input
                disabled={disabled}
                type="tel" placeholder="Phone number"
                value={phone || ''} onChange={ev => setInfoProps('phone', ev.target.value)} />
            <label>Street address</label>
            <input
                disabled={disabled}
                type="text" placeholder="Street address"
                value={streetAddress || ''} onChange={ev => setInfoProps('streetAddress', ev.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label>Postal code</label>
                    <input
                        disabled={disabled}
                        type="text" placeholder="Postal code"
                        value={postalCode || ''} onChange={ev => setInfoProps('postalCode', ev.target.value)}
                    />
                </div>
                <div>
                    <label>City</label>
                    <input
                        disabled={disabled}
                        type="text" placeholder="City"
                        value={city || ''} onChange={ev => setInfoProps('city', ev.target.value)}
                    />
                </div>
            </div>
            <label>Country</label>
            <input
                disabled={disabled}
                type="text" placeholder="Country"
                value={country || ''} onChange={ev => setInfoProps('country', ev.target.value)}
            />
        </>
    )
}
