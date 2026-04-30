"use client"
import React, { useState } from 'react'
import EditTableImage from './EditTableImage';
import UseProfile from '../UseProfile';

export default function UserForm({ user, onSave }) {
  const [userName, setUserName] = useState(user?.name || "");
  const [image, setImage] = useState(user?.image || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [streetAddress, setStreetAddress] = useState(user?.streetAddress || "");
  const [postalCode, setPostalCode] = useState(user?.postalCode || "");
  const [city, setCity] = useState(user?.city || "");
  const [country, setCountry] = useState(user?.country || "");
  const [admin, setAdmin] = useState(user?.admin || false)

  const { data: loggedInUserData } = UseProfile();
  return (
    <div className="flex gap-4">
      <div className="rounded-lg">
        <div className="relative p-2 rounded-lg max-w-[120px]">
          <EditTableImage link={image} setLink={setImage} />
        </div>
      </div>
      <form className="grow" onSubmit={ev => onSave(ev, { name: userName, image, phone,admin, streetAddress, postalCode, city, country })}>
        <label htmlFor="">Fullname</label>
        <input
          type="text"
          placeholder="First and last name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        <label htmlFor="">Email</label>
        <input type="email" disabled value={user?.email} />
        <label htmlFor="">Phone Number</label>
        <input
          type="tel"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <label htmlFor="">Street Address</label>
        <input
          type="text"
          placeholder="Street address"
          value={streetAddress}
          onChange={(e) => setStreetAddress(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="">City</label>
            <input
              type="text"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="">Postal Code</label>
            <input
              type="text"
              placeholder="Postal code"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
            />
          </div>
        </div>
        <label htmlFor="">Country</label>
        <input
          type="text"
          placeholder="Country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />
        {loggedInUserData?.admin && (
          <div>
            <label htmlFor="adminCB" className='inline-flex items-center p-1 mb-2 '>
              <input type="checkbox" id='adminCB' className='mr-2' value={"1"}
                checked={admin} onClick={ev => setAdmin(ev.target.checked)}
              />
              <span>Admin</span>
            </label>
          </div>
        )}
        <button type="submit">Save</button>
      </form>
    </div>
  )
}
