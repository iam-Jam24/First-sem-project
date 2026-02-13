const Room = require('../models/Room');
const User = require('../models/User');

const accessChat = async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.sendStatus(400);
    }

    var isChat = await Room.find({
        isGroupChat: false,
        $and: [
            { users: { $elemMatch: { $eq: req.user._id } } },
            { users: { $elemMatch: { $eq: userId } } }
        ]
    }).populate('users', '-password').populate('latestMessage');

    isChat = await User.populate(isChat, {
        path: 'latestMessage.sender',
        select: 'username avatar email'
    });

    if (isChat.length > 0) {
        res.send(isChat[0]);
    } else {
        var chatData = {
            name: "sender",
            isGroupChat: false,
            users: [req.user._id, userId]
        };

        try {
            const createdChat = await Room.create(chatData);
            const FullChat = await Room.findOne({ _id: createdChat._id }).populate('users', '-password');
            res.status(200).json(FullChat);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
};

const fetchChats = async (req, res) => {
    try {
        Room.find({ users: { $elemMatch: { $eq: req.user._id } } })
            .populate('users', '-password')
            .populate('groupAdmin', '-password')
            .populate('latestMessage')
            .sort({ updatedAt: -1 })
            .then(async (results) => {
                results = await User.populate(results, {
                    path: 'latestMessage.sender',
                    select: 'username avatar email'
                });
                res.status(200).send(results);
            });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const createGroupChat = async (req, res) => {
    if (!req.body.users || !req.body.name) {
        return res.status(400).send({ message: "Please fill all fields" });
    }

    var users = JSON.parse(req.body.users);

    if (users.length < 2) {
        return res.status(400).send("More than 2 users are required to form a group chat");
    }

    users.push(req.user);

    try {
        const groupChat = await Room.create({
            name: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user
        });

        const fullGroupChat = await Room.findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        res.status(200).json(fullGroupChat);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { accessChat, fetchChats, createGroupChat };
