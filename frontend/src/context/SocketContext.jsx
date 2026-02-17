import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext();

const ENDPOINT = "http://localhost:5001"; // Replace with your backend URL in production

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [socketConnected, setSocketConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (user) {
            const newSocket = io(ENDPOINT);
            setSocket(newSocket);

            newSocket.emit("setup", user);
            newSocket.on("connected", () => setSocketConnected(true));
            
            newSocket.on("online_users", (users) => {
                setOnlineUsers(users);
            });

            return () => {
                newSocket.disconnect();
            };
        }
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, socketConnected, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};
