import React from 'react'
import ProfileSide from '../../Components/profileSide/ProfileSide'
import PostSide from '../../Components/PostSide/PostSide'
import RightSide from '../../Components/RightSide/RightSide'
import { cn } from '../../utils/clsx'

const Home = () => {
  return (
    <div className={cn('relative grid grid-cols-1 md:grid-cols-[18rem_minmax(0,1fr)_20rem] gap-4')}>
        <ProfileSide />
        <PostSide />
        <RightSide />
    </div>
  )
}

export default Home
