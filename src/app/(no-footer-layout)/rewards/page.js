"use client"
import HeaderCart from '@/modules/cart/HeaderCart'
import RewardContent from '@/modules/rewards/RewardContent'
import RewardTop from '@/modules/rewards/RewardTop'
import { useSession } from 'next-auth/react'
import React from 'react'

function RewardsPage() {
    const session = useSession();
    const { status } = session;
    return (
        <section>
            <HeaderCart text='Teo Rewards' />
            <div className='flex flex-col items-center justify-center w-full gap-6 mb-6'>
                <RewardTop status={status}/>
                <RewardContent status={status}/>
            </div>
        </section>
    )
}

export default RewardsPage