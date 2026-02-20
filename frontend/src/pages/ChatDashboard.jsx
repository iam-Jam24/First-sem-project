import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import './ChatDashboard.css';

const ChatDashboard = () => {
    const [selectedChat, setSelectedChat] = useState(null);
    const [fetchAgain, setFetchAgain] = useState(false);

    return (
        <div className="chat-dashboard">
            <Sidebar 
                selectedChat={selectedChat} 
                setSelectedChat={setSelectedChat} 
                fetchAgain={fetchAgain} 
            />
            <ChatWindow 
                selectedChat={selectedChat} 
                setFetchAgain={setFetchAgain} 
                fetchAgain={fetchAgain} 
            />
        </div>
    );
};

export default ChatDashboard;
