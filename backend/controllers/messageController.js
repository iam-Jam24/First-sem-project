const Message = require('../models/Message');
const User = require('../models/User');
const Room = require('../models/Room');

const sendMessage = async (req, res) => {
    const { content, roomId, messageType } = req.body;
    let fileUrl = '';

    if (req.file) {
        fileUrl = `/uploads/${req.file.filename}`;
    }

    if (!content && !fileUrl) {
        return res.sendStatus(400);
    }

    var newMessage = {
        sender: req.user._id,
        content: content || 'File',
        room: roomId,
        messageType: messageType || 'text',
        fileUrl: fileUrl,
        readBy: [req.user._id]
    };

    try {
        var message = await Message.create(newMessage);

        message = await message.populate('sender', 'username avatar');
        message = await message.populate('room');
        message = await User.populate(message, {
            path: 'room.users',
            select: 'username avatar email'
        });

        await Room.findByIdAndUpdate(roomId, { latestMessage: message });

        res.json(message);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const allMessages = async (req, res) => {
    try {
        const messages = await Message.find({ room: req.params.roomId })
            .populate('sender', 'username avatar email')
            .populate('room');
        res.json(messages);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { sendMessage, allMessages };
