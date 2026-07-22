import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 190, match: /^\S+@\S+\.\S+$/ },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['super_admin', 'admin'], default: 'admin' },
  isActive: { type: Boolean, default: true },
  lastLoginAt: Date
}, { timestamps: true });

adminSchema.set('toJSON', { transform: (_doc, ret) => { delete ret.passwordHash; return ret; } });
export default mongoose.model('Admin', adminSchema);
