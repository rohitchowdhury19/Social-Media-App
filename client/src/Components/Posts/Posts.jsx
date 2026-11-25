import React, { useEffect } from 'react'
import Post from '../Post/Post';
import { useDispatch, useSelector } from 'react-redux';
import { getTimelinePosts } from '../../actions/PostAction';
import { useParams } from 'react-router-dom';
import { cn } from '../../utils/clsx';

const Posts = () => {

  const params = useParams();
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.authReducer.authData)
  let { posts, loading } = useSelector((state) => state.postReducer)


  useEffect(() => {
    dispatch(getTimelinePosts(user._id))
  }, [dispatch, user._id])


  if (params.id) {
    posts = posts.filter((post) => post.userId === params.id)
  }

  return (
    <div className={cn('flex flex-col gap-4')}>

      {loading ? "Fetching Posts..." :
        posts.map((post, id) => {
          return <Post data={post} key={post._id || id} />
        })}

    </div>
  )
}

export default Posts
