const Listing = require("../models/listing.js");
const Message = require("../models/message.js");
const User = require("../models/user.js");

function serializeMessage(message) {
    return {
        _id: String(message._id),
        listing: String(message.listing),
        sender: {
            _id: String(message.sender?._id || message.sender),
            username: message.sender?.username || "User",
        },
        body: message.body,
        createdAt: message.createdAt,
    };
}

async function getSocketUser(socket) {
    const userId = socket.request.session?.passport?.user;
    if (!userId) {
        return null;
    }

    if (socket.request.user && String(socket.request.user._id) === String(userId)) {
        return socket.request.user;
    }

    const user = await User.findById(userId);
    socket.request.user = user;
    return user;
}

function registerChatHandlers(io, sessionMiddleware) {
    io.use((socket, next) => {
        sessionMiddleware(socket.request, {}, next);
    });

    io.use(async (socket, next) => {
        try {
            await getSocketUser(socket);
            next();
        } catch (error) {
            next(error);
        }
    });

    io.on("connection", (socket) => {
        socket.on("listing:join", ({ listingId }) => {
            if (listingId) {
                socket.join(`listing:${listingId}`);
            }
        });

        socket.on("listing:message", async ({ listingId, body }) => {
            try {
                const currentUser = await getSocketUser(socket);
                if (!currentUser) {
                    socket.emit("listing:error", {
                        message: "Please log in to chat",
                    });
                    return;
                }

                if (!listingId || !body || !body.trim()) {
                    return;
                }

                const listing = await Listing.findById(listingId);
                if (!listing) {
                    return;
                }

                const message = await Message.create({
                    listing: listing._id,
                    sender: currentUser._id,
                    body: body.trim(),
                });

                const populatedMessage = await Message.findById(message._id)
                    .populate("sender", "username");

                io.to(`listing:${listingId}`).emit(
                    "listing:message",
                    serializeMessage(populatedMessage)
                );
            } catch (error) {
                socket.emit("listing:error", {
                    message: "Unable to send message right now",
                });
            }
        });
    });
}

module.exports = {
    registerChatHandlers,
};
