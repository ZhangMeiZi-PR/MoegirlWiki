const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
  avatar: {
    type: String,
  },
  refreshToken: {
    type: String,
  },
  roles: {
    type: Object,
    default: { Editor: 2007 }
  }

  
}, { timestamps: true });


//Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return ;
  this.password = await bcrypt.hash(this.password, 10);
});

const User = mongoose.model('User', userSchema);
module.exports = User;

