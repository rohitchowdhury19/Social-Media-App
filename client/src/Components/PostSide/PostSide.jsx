import React from 'react'
import PostShare from '../PostShare/PostShare'
import Posts from '../Posts/Posts'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { cn } from '../../utils/clsx'

const PostSide = () => {
  const params = useParams();
  const { user } = useSelector((state) => state.authReducer.authData);
  const isOwnProfile = !params.id || params.id === user._id;

  return (
    <div className={cn('flex flex-col gap-4 h-screen overflow-auto')}>
        {isOwnProfile && <PostShare />}
        <Posts />
    </div>
  )
}

export default PostSide
