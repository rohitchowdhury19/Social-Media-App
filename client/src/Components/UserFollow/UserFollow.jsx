import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { followUser, unFollowUser } from '../../actions/UserAction';
import publicFolder from '../../utils/publicFolder';
import { cn } from '../../utils/clsx';
import { buttonClass } from '../../utils/styles';



const UserFollow = ({ person }) => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.authReducer.authData);
    const [following, setFollowing] = useState(person.followers.includes(user._id));

    const handleFollow = () => {
        following ? dispatch(unFollowUser(person._id, user))
            : dispatch(followUser(person._id, user))

        setFollowing((prev) => !prev)
    }

    return (
        <div className="flex justify-between items-center">

            <div className="group flex gap-[10px] cursor-pointer" onClick={() => navigate(`/profile/${person._id}`)}>
                <img
                    src={person.profilePicture ? publicFolder + person.profilePicture : publicFolder + "defaultProfile.png"}
                    alt=""
                    className="w-[3.2rem] h-[3.2rem] rounded-full object-cover"
                />
                <div className="flex flex-col items-start justify-center">
                    <span className="font-bold group-hover:text-purplePain transition-colors">{person.firstname}</span>
                    <span>@{person.firstname}  {person.lastname}</span>
                </div>
            </div>

            <button
                className={cn(buttonClass, 'h-8 px-[15px]')}
                onClick={(e) => {
                    e.stopPropagation();
                    handleFollow();
                }}
            >
                {following ? "Unfollow" : "Follow"}
            </button>

        </div>

    )
}

export default UserFollow
