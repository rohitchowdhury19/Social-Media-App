import React, { useState } from 'react';
import Comment from '../../Img/comment.png';
import Share from '../../Img/share.png';
import Like from '../../Img/like.png';
import Notlike from '../../Img/notlike.png';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useDispatch, useSelector } from 'react-redux';
import { commentPost, likePost } from '../../api/PostRequest';
import { deletePost } from '../../actions/PostAction';
import publicFolder from '../../utils/publicFolder';
import { cn } from '../../utils/clsx';
import { buttonClass, cardClass, inputClass } from '../../utils/styles';



const Post = ({ data }) => {

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.authReducer.authData)
  const [liked, setLiked] = useState(data.likes.includes(user._id))
  const [likes, setLikes] = useState(data.likes.length)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState(data.comments || [])
  const [commentText, setCommentText] = useState('')


  const handleLike = () => {
    setLiked((prev) => !prev)
    likePost(data._id, user._id)
    liked ? setLikes((prev) => prev - 1) : setLikes((prev) => prev + 1)
  }

  const handleComment = async (e) => {
    e.preventDefault();

    if (!commentText.trim()) {
      return;
    }

    const comment = {
      userId: user._id,
      name: `${user.firstname} ${user.lastname}`,
      text: commentText
    };

    const { data: savedComment } = await commentPost(data._id, comment);
    setComments((prev) => [...prev, savedComment]);
    setCommentText('');
  }

  const handleShare = async () => {
    const postLink = `${window.location.origin}/profile/${data.userId}`;

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(postLink);
      window.alert('Post link copied!');
    } else {
      window.alert(postLink);
    }
  }

  const handleDelete = () => {
    if (window.confirm('Delete this post?')) {
      dispatch(deletePost(data._id, user._id));
    }
  }

  const mediaClass = 'w-full max-h-80 object-cover rounded-lg';

  return (
    <div className={cn(cardClass, 'flex flex-col gap-4 relative')}>
      {data.userId === user._id && (
        <button
          className={cn('absolute top-[0.8rem] right-[0.8rem] w-8 h-8 border-0 rounded-full grid place-items-center bg-white/90 text-location cursor-pointer shadow-soft hover:bg-location hover:text-white transition-colors')}
          onClick={handleDelete}
          title="Delete post"
        >
          <DeleteOutlineIcon fontSize="small" />
        </button>
      )}

      {data.image && (
        data.mediaType === 'video'
          ? <video src={data.image.startsWith('http') ? data.image : publicFolder + data.image} controls className={mediaClass} />
          : <img src={data.image.startsWith('http') ? data.image : publicFolder + data.image} alt="" className={mediaClass} />
      )}

      <div className="flex items-start gap-6">
        <img src={liked ? Like : Notlike} alt="" className="cursor-pointer" onClick={handleLike} />
        <img src={Comment} alt="" className="cursor-pointer" onClick={() => setShowComments((prev) => !prev)} />
        <img src={Share} alt="" className="cursor-pointer" onClick={handleShare} />
      </div>

      <span className="text-muted text-sm">{likes} likes</span>
      <span className="text-muted text-sm cursor-pointer" onClick={() => setShowComments((prev) => !prev)}>
        {comments.length} comments
      </span>

      <div>
        <span> <b>{data.name}</b> </span>
        <span>{data.desc}</span>
      </div>

      {showComments && (
        <div className={cn('flex flex-col gap-[0.7rem] border-t border-hrColor pt-[0.8rem]')}>
          {comments.map((comment) => (
            <div className="flex gap-[0.4rem] text-sm" key={comment._id || comment.createdAt}>
              <b>{comment.name}</b>
              <span>{comment.text}</span>
            </div>
          ))}

          <form className="grid grid-cols-[1fr_5rem] gap-[0.6rem]" onSubmit={handleComment}>
            <input
              className={cn(inputClass, 'p-[0.7rem]')}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
            />
            <button className={cn(buttonClass)} type="submit">Post</button>
          </form>
        </div>
      )}

    </div>
  )
}

export default Post
