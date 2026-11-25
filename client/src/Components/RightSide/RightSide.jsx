import React, { useEffect, useState } from 'react';
import Home from '../../Img/home.png';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import Noti from '../../Img/noti.png';
import Comment from '../../Img/comment.png';
import TrendCard from '../TrendCard/TrendCard';
import ShareModal from '../ShareModal/ShareModal';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getNotifications } from '../../api/NotificationRequest';
import { useSocket } from '../../context/SocketContext';
import { cn } from '../../utils/clsx';
import { buttonClass } from '../../utils/styles';

const RightSide = () => {

    const [modalOpened, setModalOpened] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [messageCount, setMessageCount] = useState(0);
    const { user } = useSelector((state) => state.authReducer.authData);
    const { socket } = useSocket() || {};

    useEffect(() => {
        const fetchUnreadCount = async () => {
            const { data } = await getNotifications(user._id);
            setUnreadCount(data.filter((notification) => !notification.isRead).length);
            setMessageCount(data.filter((notification) => !notification.isRead && notification.type === 'message').length);
        };

        fetchUnreadCount();
    }, [user._id]);

    useEffect(() => {
        if (!socket) {
            return;
        }

        const handleNotification = (notification) => {
            setUnreadCount((prev) => prev + 1);
            if (notification.type === 'message') {
                setMessageCount((prev) => prev + 1);
            }
        };

        socket.on('newNotification', handleNotification);

        return () => socket.off('newNotification', handleNotification);
    }, [socket]);

    const navBadgeClass =
        'absolute -top-[0.45rem] -right-[0.55rem] min-w-4 h-4 px-[0.2rem] rounded-full bg-location text-white text-[0.7rem] flex items-center justify-center';

    return (
        <div className={cn('flex flex-col gap-8')}>
            <div className="mt-4 flex justify-between items-center">

                <Link to='../home'>
                    <img src={Home} alt="" className="w-8 h-8" />
                </Link>

                <SettingsOutlinedIcon />
                <Link to="/notifications" className="relative inline-flex items-center">
                    <img src={Noti} alt="Notifications" className="w-6 h-6" />
                    {unreadCount > 0 && <span className={navBadgeClass}>{unreadCount}</span>}
                </Link>
                <Link to="/chat" className="relative inline-flex items-center">
                    <img src={Comment} alt="Messages" className="w-6 h-6" />
                    {messageCount > 0 && <span className={navBadgeClass}>{messageCount}</span>}
                </Link>
            </div>

            <TrendCard />

            <div className={cn(buttonClass, 'h-12 w-4/5 self-center')} onClick={() => setModalOpened(true)}>
                Share
            </div>
            <ShareModal modalOpened={modalOpened} setModalOpened={setModalOpened} />

        </div>
    )
}

export default RightSide
