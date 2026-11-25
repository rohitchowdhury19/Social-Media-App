import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Home from '../../Img/home.png';
import { getAllUser } from '../../api/UserRequest';
import { createConversation, createMessage, getConversations, getMessages, markMessagesRead } from '../../api/MessageRequest';
import { useSocket } from '../../context/SocketContext';
import publicFolder from '../../utils/publicFolder';
import { cn } from '../../utils/clsx';
import { avatarClass, buttonClass, inputClass } from '../../utils/styles';

const Chat = () => {
    const { user } = useSelector((state) => state.authReducer.authData);
    const { socket, onlineUsers } = useSocket() || {};
    const [conversations, setConversations] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    const refreshConversations = useCallback(async () => {
        const { data } = await getConversations(user._id);
        setConversations(data);
    }, [user._id]);

    useEffect(() => {
        const fetchData = async () => {
            const [conversationRes, usersRes] = await Promise.all([
                getConversations(user._id),
                getAllUser()
            ]);

            setConversations(conversationRes.data);
            setAllUsers(usersRes.data.filter((person) => person._id !== user._id));
        };

        fetchData();
    }, [user._id]);

    useEffect(() => {
        if (!currentChat?._id) {
            return;
        }

        const fetchMessages = async () => {
            const { data } = await getMessages(currentChat._id);
            setMessages(data);
            markMessagesRead(currentChat._id, user._id);
        };

        fetchMessages();
    }, [currentChat?._id, user._id]);

    useEffect(() => {
        if (!socket) {
            return;
        }

        const handleMessage = (message) => {
            if (message.conversationId === currentChat?._id) {
                setMessages((prev) => [...prev, message]);
                markMessagesRead(message.conversationId, user._id);
            }
            refreshConversations();
        };

        socket.on('receiveMessage', handleMessage);

        return () => socket.off('receiveMessage', handleMessage);
    }, [socket, currentChat?._id, user._id, refreshConversations]);

    const usersWithoutConversation = useMemo(() => {
        const conversationUserIds = conversations.map((conversation) => conversation.user?._id);
        return allUsers.filter((person) => !conversationUserIds.includes(person._id));
    }, [allUsers, conversations]);

    const handleStartConversation = async (receiverId) => {
        const { data } = await createConversation(user._id, receiverId);
        setCurrentChat(data);
        await refreshConversations();
    };

    const handleSend = async (e) => {
        e.preventDefault();

        if (!newMessage.trim() || !currentChat?._id) {
            return;
        }

        const messageBody = {
            conversationId: currentChat._id,
            senderId: user._id,
            text: newMessage.trim()
        };

        const { data } = await createMessage(messageBody);
        setMessages((prev) => [...prev, data]);
        setNewMessage('');
        refreshConversations();
    };

    const renderUserImage = (person) => (
        <img
            src={person?.profilePicture ? publicFolder + person.profilePicture : publicFolder + 'defaultProfile.png'}
            alt=""
            className={avatarClass}
        />
    );

    const conversationItemClass =
        'w-full border-0 bg-transparent grid grid-cols-[3rem_1fr_0.6rem] items-center gap-[0.7rem] p-2 rounded-lg text-ink text-left cursor-pointer hover:bg-white transition-colors';

    return (
        <div className={cn('min-h-[calc(100vh-2rem)] flex flex-col gap-4')}>
            <div className={cn('max-w-[1100px] w-full mx-auto grid grid-cols-[3rem_1fr] items-center gap-4 bg-cardColor rounded-lg p-4')}>
                <Link to="/home" className="inline-flex items-center justify-center">
                    <img src={Home} alt="Home" className="w-8 h-8" />
                </Link>
                <h2 className="text-2xl font-bold m-0">Messages</h2>
            </div>

            <div className={cn('max-w-[1100px] w-full mx-auto grid grid-cols-1 md:grid-cols-[320px_1fr] md:h-[calc(100vh-7rem)] gap-4')}>
                <div className={cn('bg-cardColor rounded-lg p-4 overflow-auto flex flex-col gap-[0.6rem] min-h-[360px] md:min-h-0')}>
                    <h3 className="text-lg font-bold my-2">Chats</h3>
                    {conversations.map((conversation) => (
                        <button
                            className={cn(conversationItemClass, currentChat?._id === conversation._id && 'bg-white')}
                            key={conversation._id}
                            onClick={() => setCurrentChat(conversation)}
                        >
                            {renderUserImage(conversation.user)}
                            <span className="flex flex-col gap-[0.2rem] overflow-hidden">
                                <b>{conversation.user?.firstname} {conversation.user?.lastname}</b>
                                <small className="text-muted truncate">{conversation.lastMessage || 'Start chatting'}</small>
                            </span>
                            {onlineUsers?.includes(conversation.user?._id) && (
                                <i className="block w-[0.6rem] h-[0.6rem] rounded-full bg-photo" />
                            )}
                        </button>
                    ))}

                    <h3 className="text-lg font-bold my-2">New message</h3>
                    {usersWithoutConversation.map((person) => (
                        <button className={cn(conversationItemClass)} key={person._id} onClick={() => handleStartConversation(person._id)}>
                            {renderUserImage(person)}
                            <span className="flex flex-col gap-[0.2rem] overflow-hidden">
                                <b>{person.firstname} {person.lastname}</b>
                                <small className="text-muted truncate">{onlineUsers?.includes(person._id) ? 'Online' : 'Offline'}</small>
                            </span>
                        </button>
                    ))}
                </div>

                <div className={cn('bg-cardColor rounded-lg p-4 overflow-auto grid grid-rows-[auto_1fr_auto] gap-4 min-h-[360px] md:min-h-0')}>
                    {currentChat ? (
                        <>
                            <div className="flex items-center gap-[0.8rem] border-b border-hrColor pb-4">
                                {renderUserImage(currentChat.user)}
                                <div className="flex flex-col gap-[0.2rem] overflow-hidden">
                                    <b>{currentChat.user?.firstname} {currentChat.user?.lastname}</b>
                                    <small className="text-muted truncate">{onlineUsers?.includes(currentChat.user?._id) ? 'Online' : 'Offline'}</small>
                                </div>
                            </div>

                            <div className="flex flex-col gap-[0.6rem] overflow-auto">
                                {messages.map((message) => (
                                    <div
                                        className={cn(
                                            'w-fit max-w-[70%] rounded-[0.8rem] px-[0.9rem] py-[0.7rem]',
                                            message.senderId === user._id ? 'self-end text-white bg-darkPurple' : 'bg-white'
                                        )}
                                        key={message._id}
                                    >
                                        {message.text}
                                    </div>
                                ))}
                            </div>

                            <form className="grid grid-cols-[1fr_6rem] gap-[0.7rem]" onSubmit={handleSend}>
                                <input
                                    className={cn(inputClass, 'p-[0.9rem]')}
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Message..."
                                />
                                <button className={cn(buttonClass)} type="submit">Send</button>
                            </form>
                        </>
                    ) : (
                        <div className="grid place-items-center text-muted">Select a chat or start a new message.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chat;
