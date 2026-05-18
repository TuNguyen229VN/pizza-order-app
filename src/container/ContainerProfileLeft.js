import React from 'react'

export default function ContainerProfileLeft({ title, children, className }) {
  return (
    <div className={`px-4 md:p-4 md:border md:rounded-2xl ${className} overflow-hidden`}>
      <p className='text-2xl md:text-[28px] font-semibold leading-10 capitalize text-blackHeader'>{title}</p>
      {children}
    </div>
  )
}
