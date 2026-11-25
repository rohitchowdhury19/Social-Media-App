import React, { useEffect, useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import ProfileModal from '../ProfileModal/ProfileModal.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import * as UserApi from '../../api/UserRequest.js';
import { logOut } from '../../actions/AuthAction';
import { cn } from '../../utils/clsx';
import { buttonClass, cardClass } from '../../utils/styles';



const InfoCard = () => {

  const [modalOpened, setModalOpened] = useState(false);
  const dispatch = useDispatch();
  const params = useParams();
  const profileUserId = params.id;

  const [profileUser, setProfileUser] = useState({});

  const { user } = useSelector((state) => state.authReducer.authData);


  useEffect(() => {
    const fetchProfileUser = async () => {
      if (profileUserId === user._id) {
        setProfileUser(user);

      } else {
        const { data } = await UserApi.getUser(profileUserId)
        setProfileUser(data);
      }

    }

    fetchProfileUser();
  }, [profileUserId, user]);



  const handleLogOut = () => {
    dispatch(logOut());
  }


  return (
    <div className={cn(cardClass, 'flex flex-col gap-3 w-[90%]')}>

      <div className="flex justify-between items-center">
        <h4 className="text-base font-bold">Profile Info</h4>

        {user._id === profileUserId ?

          (<div className="cursor-pointer">
            <EditIcon width='2rem' height='1.2rem'
              onClick={() => setModalOpened(true)} />

            <ProfileModal modalOpened={modalOpened} setModalOpened={setModalOpened}
              data={user}
            />
          </div>)
          : (" ")
        }

      </div>

      <div>
        <span>
          <b>Status </b>
        </span>
        <span>{profileUser.relationship}</span>
      </div>

      <div>
        <span>
          <b>Lives in </b>
        </span>
        <span>{profileUser.livesin}</span>
      </div>

      <div>
        <span>
          <b>Works at </b>
        </span>
        <span>{profileUser.worksAt}</span>
      </div>

      <button className={cn(buttonClass, 'w-28 h-8 mt-24 self-end')} onClick={handleLogOut}>Log Out</button>
    </div>
  )
}

export default InfoCard
