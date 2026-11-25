import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { getUser } from '../../api/UserRequest';
import publicFolder from '../../utils/publicFolder';
import { cn } from '../../utils/clsx';

const ProfileCard = ({ location }) => {
    const { user } = useSelector((state) => state.authReducer.authData);
    const posts = useSelector((state) => state.postReducer.posts);
    const params = useParams();
    const profileUserId = params.id || user._id;
    const isOwnProfile = profileUserId === user._id;
    const [profileUser, setProfileUser] = useState(user);

    useEffect(() => {
        const fetchProfileUser = async () => {
            if (isOwnProfile) {
                setProfileUser(user);
                return;
            }

            const { data } = await getUser(profileUserId);
            setProfileUser(data);
        };

        fetchProfileUser();
    }, [profileUserId, isOwnProfile, user]);

    const followStatClass = 'flex flex-col items-center justify-center gap-[0.4rem]';

    return (
        <div className={cn('rounded-3xl flex flex-col relative gap-4 bg-cardColor overflow-x-clip mt-7 w-full')}>
            <div className="relative flex flex-col items-center justify-center">
                <img
                    src={profileUser.coverPicture ? publicFolder + profileUser.coverPicture : publicFolder + "defaultCover.jpg"}
                    alt=""
                    className="w-full h-32 object-cover"
                />
                <img
                    src={profileUser.profilePicture ? publicFolder + profileUser.profilePicture : publicFolder + "defaultProfile.png"}
                    alt=""
                    className="w-24 h-24 object-cover rounded-full absolute -bottom-12 shadow-profile border-4 border-white"
                />
            </div>

            <div className="flex flex-col items-center mt-12 gap-[10px]">
                <span className="font-bold">{profileUser.firstname} {profileUser.lastname}</span>
                <span>{profileUser.worksAt ? profileUser.worksAt : "write about yourself..."}</span>
            </div>

            <div className="flex flex-col items-center justify-center gap-3">
                <hr className="w-[85%] border border-gray-500" />
                <div className="flex gap-4 w-4/5 justify-around items-center">
                    <div className={followStatClass}>
                        <span className="font-bold">{profileUser.followers?.length || 0}</span>
                        <span className="text-black text-[15px]">Followers</span>
                    </div>
                    <div className="border-l border-gray-500 h-[50px]"></div>
                    <div className={followStatClass}>
                        <span className="font-bold">{profileUser.following?.length || 0}</span>
                        <span className="text-black text-[15px]">Following</span>
                    </div>

                    {location === "profilePage" && (
                        <>
                            <div className="border-l border-gray-500 h-[50px]"></div>
                            <div className={followStatClass}>
                                <span className="font-bold">{posts.filter((post) => post.userId === profileUserId).length}</span>
                                <span className="text-black text-[15px]">Posts</span>
                            </div>
                        </>
                    )}
                </div>
                <hr className="w-[85%] border border-gray-500" />
            </div>

            {location === "profilePage" || !isOwnProfile ? '' :
                <span className="font-bold text-purplePain self-center mb-4 cursor-pointer">
                    <Link className="no-underline text-inherit" to={`/profile/${user._id}`}>My Profile</Link>
                </span>
            }
        </div>
    );
};

export default ProfileCard;
