import React from 'react'

export default function ContainerProfileLeft({ title, children, className }) {
  return (
    <div className={`px-4 py-4 border rounded-2xl ${className}`}>
      <p className='text-[28px] leading-10 font-semibold text-blackHeader capitalize'>{title}</p>
      {children}
    </div>
  )
}
