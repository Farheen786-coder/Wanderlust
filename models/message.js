const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema(
    {
        listing: {
            type: Schema.Types.ObjectId,
            ref: "Listing",
            required: true,
            index: true,
        },
        sender: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        body: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000,
        },
    },
    { timestamps: true }
);

messageSchema.index({ listing: 1, createdAt: 1 });

module.exports = mongoose.model("Message", messageSchema);
