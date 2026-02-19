import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import '../pages/ChatDashboard.css';

const ChatWindow = ({ selectedChat, setFetchAgain, fetchAgain }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const { user } = useContext(AuthContext);
    const { socket, socketConnected, onlineUsers } = useContext(SocketContext);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchMessages = async () => {
        if (!selectedChat) return;
        try {
            const { data } = await axios.get(`http://localhost:5001/api/messages/${selectedChat._id}`);
            setMessages(data);
            socket.emit("join_room", selectedChat._id);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, [selectedChat]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    useEffect(() => {
        if (!socket) return;
        socket.on("message_recieved", (newMessageRecieved) => {
            if (!selectedChat || selectedChat._id !== newMessageRecieved.room._id) {
                // give notification
                setFetchAgain(!fetchAgain);
            } else {
                setMessages([...messages, newMessageRecieved]);
            }
        });

        socket.on("typing", () => setIsTyping(true));
        socket.on("stop_typing", () => setIsTyping(false));

        return () => {
            socket.off("message_recieved");
            socket.off("typing");
            socket.off("stop_typing");
        };
    });

    const sendMessage = async (e) => {
        if (e.key === "Enter" || e.type === "click") {
            if (newMessage) {
                socket.emit("stop_typing", selectedChat._id);
                try {
                    const { data } = await axios.post("http://localhost:5001/api/messages", {
                        content: newMessage,
                        roomId: selectedChat._id,
                    });
                    setNewMessage("");
                    socket.emit("new_message", data);
                    setMessages([...messages, data]);
                    setFetchAgain(!fetchAgain);
                } catch (error) {
                    console.error(error);
                }
            }
        }
    };

    const typingHandler = (e) => {
        setNewMessage(e.target.value);

        if (!socketConnected) return;

        if (!typing) {
            setTyping(true);
            socket.emit("typing", selectedChat._id);
        }

        let lastTypingTime = new Date().getTime();
        var timerLength = 3000;
        setTimeout(() => {
            var timeNow = new Date().getTime();
            var timeDiff = timeNow - lastTypingTime;
            if (timeDiff >= timerLength && typing) {
                socket.emit("stop_typing", selectedChat._id);
                setTyping(false);
            }
        }, timerLength);
    };

    if (!selectedChat) {
        return (
            <div className="no-chat-selected">
                <h2>Welcome, {user.username}!</h2>
                <p>Select a chat to start messaging</p>
            </div>
        );
    }

    const sender = selectedChat.isGroupChat ? null : selectedChat.users.find(u => u._id !== user._id);
    const isOnline = sender && onlineUsers.includes(sender._id);

    return (
        <div className="chat-window">
            <div className="chat-header">
                <img src={sender ? sender.avatar : `https://api.dicebear.com/7.x/initials/svg?seed=${selectedChat.name}`} alt="avatar" style={{width: 40, height: 40, borderRadius: '50%'}} />
                <div className="chat-header-info">
                    <h3>{selectedChat.isGroupChat ? selectedChat.name : sender.username}</h3>
                    <p>{isOnline ? 'Online' : (selectedChat.isGroupChat ? 'Group Chat' : 'Offline')}</p>
                </div>
            </div>

            <div className="messages-container">
                {messages.map((m, i) => (
                    <div key={m._id} className={`message-bubble ${m.sender._id === user._id ? 'message-sent' : 'message-received'}`}>
                        {m.content}
                        <span className="message-time">{new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                ))}
                {isTyping && (
                    <div className="message-bubble message-received" style={{fontStyle: 'italic', opacity: 0.7}}>
                        Typing...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-container">
                <input 
                    type="text" 
                    placeholder="Type a message..." 
                    value={newMessage}
                    onChange={typingHandler}
                    onKeyDown={sendMessage}
                />
                <button className="send-btn" onClick={sendMessage}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default ChatWindow;
