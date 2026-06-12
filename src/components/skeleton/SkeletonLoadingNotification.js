import React from 'react'

export default function SkeletonLoadingNotification({hasNotipage}) {
    return (
        <div className="p-3 border-b animate-pulse">
            <div className={`w-3/4  mb-2 bg-gray-200 rounded ${hasNotipage?"h-4":"h-3"}`}></div>
            <div className={`w-1/2  bg-gray-100 rounded ${hasNotipage?"h-3":"h-2"}`}></div>
            <p className={`h-2 mt-1 bg-gray-100 w-14  ${hasNotipage?"mr-0 ml-auto":""}`}></p>
        </div>
    )
}
