"use client"
import React, { useState } from 'react'
import EditTableImage from './EditTableImage';
import UseProfile from '../UseProfile';
import AddressInput from './AddressInput';

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

   function handleAddressChange(propName, value) {
    if (propName === 'phone') setPhone(value);
    if (propName === 'streetAddress') setStreetAddress(value);
    if (propName === 'postalCode') setPostalCode(value);
    if (propName === 'city') setCity(value);
    if (propName === 'country') setCountry(value);
  }
  
  return (
    <div className="flex gap-4">
      <div className="rounded-lg">
        <div className="relative p-2 rounded-lg max-w-[120px]">
          <EditTableImage link={image} setLink={setImage} />
        </div>
      </div>
      <form className="grow" onSubmit={ev => onSave(ev, { name: userName, image, phone, admin, streetAddress, postalCode, city, country })}>
        <label htmlFor="">Fullname</label>
        <input
          type="text"
          placeholder="First and last name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        <label htmlFor="">Email</label>
        <input type="email" disabled value={user?.email} />
        
        <AddressInput
          addressProps={{ phone, streetAddress, postalCode, city, country }}
          setAddressProp={handleAddressChange}
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
