import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Home from '../../Img/home.png';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../../api/NotificationRequest';
import { useSocket } from '../../context/SocketContext';
import publicFolder from '../../utils/publicFolder';
import { cn } from '../../utils/clsx';
import { avatarClass, buttonClass } from '../../utils/styles';

const Notifications = () => {
    const { user } = useSelector((state) => state.authReducer.authData);
    const { socket } = useSocket() || {};
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchNotifications = async () => {
            const { data } = await getNotifications(user._id);
            setNotifications(data);
        };

        fetchNotifications();
    }, [user._id]);

    useEffect(() => {
        if (!socket) {
            return;
        }

        const handleNotification = (notification) => {
            setNotifications((prev) => [notification, ...prev]);
        };

        socket.on('newNotification', handleNotification);

        return () => socket.off('newNotification', handleNotification);
    }, [socket]);

    const handleReadAll = async () => {
        await markAllNotificationsRead(user._id);
        setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })));
    };

    const handleReadOne = async (notificationId) => {
        await markNotificationRead(notificationId);
        setNotifications((prev) => prev.map((notification) => (
            notification._id === notificationId ? { ...notification, isRead: true } : notification
        )));
    };

    return (
        <div className={cn('min-h-[calc(100vh-2rem)] max-w-[760px] mx-auto flex flex-col gap-4')}>
            <div className={cn('grid grid-cols-[2.5rem_1fr] sm:grid-cols-[3rem_1fr_auto] items-center gap-4 bg-cardColor rounded-lg p-4')}>
                <Link to="/home" className="inline-flex items-center justify-center">
                    <img src={Home} alt="Home" className="w-8 h-8" />
                </Link>
                <h2 className="text-2xl font-bold m-0">Notifications</h2>
                <button className={cn(buttonClass, 'h-[2.4rem] px-4 col-span-full w-full sm:col-auto sm:w-auto')} onClick={handleReadAll}>Mark all read</button>
            </div>

            <div className="flex flex-col gap-[0.7rem]">
                {notifications.length === 0 && <span className="text-muted">No notifications yet.</span>}

                {notifications.map((notification) => (
                    <div
                        className={cn(
                            'grid grid-cols-[3rem_1fr] gap-[0.8rem] items-center rounded-lg p-[0.9rem] cursor-pointer transition-colors',
                            notification.isRead ? 'bg-cardColor' : 'bg-white border-l-4 border-purplePain'
                        )}
                        key={notification._id}
                        onClick={() => handleReadOne(notification._id)}
                    >
                        <img
                            src={notification.sender?.profilePicture ? publicFolder + notification.sender.profilePicture : publicFolder + 'defaultProfile.png'}
                            alt=""
                            className={avatarClass}
                        />
                        <div className="flex flex-col gap-[0.2rem]">
                            <span>
                                <b>{notification.sender?.firstname} {notification.sender?.lastname}</b> {notification.text}
                            </span>
                            <small className="text-muted">{new Date(notification.createdAt).toLocaleString()}</small>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Notifications;
