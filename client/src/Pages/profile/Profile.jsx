import React from 'react';
import ProfilePageLeft from '../../Components/ProfilePageLeft/ProfilePageLeft';
import ProfileCard from '../../Components/ProfileCard/ProfileCard';
import PostSide from '../../Components/PostSide/PostSide';
import RightSide from '../../Components/RightSide/RightSide';
import { cn } from '../../utils/clsx';


const Profile = () => {
  return (
    <div className={cn('relative grid grid-cols-1 md:grid-cols-[18rem_minmax(0,1fr)_20rem] gap-4')}>
      <ProfilePageLeft />

      <div className={cn('flex flex-col gap-4')}>
        <ProfileCard location="profilePage" />
        <PostSide />
      </div>


      <RightSide />

    </div>
  )
}

export default Profile
