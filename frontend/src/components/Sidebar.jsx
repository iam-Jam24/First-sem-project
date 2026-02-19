import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import '../pages/ChatDashboard.css';

const Sidebar = ({ selectedChat, setSelectedChat, fetchAgain }) => {
    const [search, setSearch] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const [chats, setChats] = useState([]);
    const { user, logout } = useContext(AuthContext);
    const { onlineUsers } = useContext(SocketContext);

    const fetchChats = async () => {
        try {
            const { data } = await axios.get('http://localhost:5001/api/rooms');
            setChats(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchChats();
    }, [fetchAgain]);

    const handleSearch = async (e) => {
        setSearch(e.target.value);
        if (!e.target.value) {
            setSearchResult([]);
            return;
        }
        try {
            const { data } = await axios.get(`http://localhost:5001/api/users?search=${e.target.value}`);
            setSearchResult(data);
        } catch (error) {
            console.error(error);
        }
    };

    const accessChat = async (userId) => {
        try {
            const { data } = await axios.post('http://localhost:5001/api/rooms', { userId });
            if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
            setSelectedChat(data);
            setSearchResult([]);
            setSearch('');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <div className="user-profile">
                    <img src={user.avatar} alt={user.username} />
                    <h3>{user.username}</h3>
                </div>
                <button onClick={logout} className="logout-btn">Logout</button>
            </div>
            <div className="search-bar">
                <input 
                    type="text" 
                    placeholder="Search users..." 
                    value={search}
                    onChange={handleSearch}
                />
            </div>
            <div className="chat-list">
                {searchResult.length > 0 ? (
                    searchResult.map(u => (
                        <div key={u._id} className="chat-item" onClick={() => accessChat(u._id)}>
                            <div className="chat-item-avatar">
                                <img src={u.avatar} alt="avatar" />
                                {onlineUsers.includes(u._id) && <span className="online-indicator"></span>}
                            </div>
                            <div className="chat-item-info">
                                <h4>{u.username}</h4>
                                <p>{u.email}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    chats.map(chat => {
                        const sender = chat.isGroupChat ? chat : chat.users.find(u => u._id !== user._id);
                        if (!sender) return null;
                        return (
                            <div 
                                key={chat._id} 
                                className={`chat-item ${selectedChat?._id === chat._id ? 'active' : ''}`}
                                onClick={() => setSelectedChat(chat)}
                            >
                                <div className="chat-item-avatar">
                                    <img src={sender.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${sender.name}`} alt="avatar" />
                                    {!chat.isGroupChat && onlineUsers.includes(sender._id) && <span className="online-indicator"></span>}
                                </div>
                                <div className="chat-item-info">
                                    <h4>{chat.isGroupChat ? chat.name : sender.username}</h4>
                                    <p>{chat.latestMessage?.content || "No messages yet"}</p>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    );
};

export default Sidebar;
