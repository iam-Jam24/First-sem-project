const { Server } = require('socket.io');

const initSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*", // Replace with frontend URL in production
            methods: ["GET", "POST"],
        },
    });

    let onlineUsers = new Map();

    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id}`);

        socket.on("setup", (userData) => {
            if (userData && userData._id) {
                socket.join(userData._id);
                onlineUsers.set(userData._id, socket.id);
                io.emit("online_users", Array.from(onlineUsers.keys()));
                console.log(`User Setup: ${userData._id}`);
                socket.emit("connected");
            }
        });

        socket.on("join_room", (room) => {
            socket.join(room);
            console.log(`User Joined Room: ${room}`);
        });

        socket.on("typing", (room) => socket.in(room).emit("typing", room));
        socket.on("stop_typing", (room) => socket.in(room).emit("stop_typing", room));

        socket.on("new_message", (newMessageRecieved) => {
            var chat = newMessageRecieved.room;

            if (!chat || !chat.users) return console.log("chat.users not defined");

            chat.users.forEach(user => {
                if (user._id === newMessageRecieved.sender._id) return;
                socket.in(user._id).emit("message_recieved", newMessageRecieved);
            });
        });

        socket.on("disconnect", () => {
            console.log("USER DISCONNECTED");
            // Find and remove user from online list
            for (let [userId, socketId] of onlineUsers.entries()) {
                if (socketId === socket.id) {
                    onlineUsers.delete(userId);
                    io.emit("online_users", Array.from(onlineUsers.keys()));
                    break;
                }
            }
        });
    });
};

module.exports = { initSocket };
