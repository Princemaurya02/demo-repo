import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
    {
        username:     { type: String, required: true, trim: true, maxlength: 40 },
        email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
        password:     { type: String, default: null },          // null for OAuth users
        profilePhoto: { type: String, default: '' },
        provider:     { type: String, enum: ['local', 'google'], default: 'local' },
        bio:          { type: String, default: '' },
        avatarColor:  { type: String, default: '#7c6eff' },
    },
    { timestamps: true }
);

export default mongoose.model('User', UserSchema);
