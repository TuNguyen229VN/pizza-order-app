import React from 'react'

export default function ContainerProfileLeft({ title, children, className }) {
  return (
    <div className={`px-4 py-4 border rounded-2xl ${className}`}>
      <p className='text-[28px] font-semibold leading-10 capitalize text-blackHeader'>{title}</p>
      {children}
    </div>
  )
}
