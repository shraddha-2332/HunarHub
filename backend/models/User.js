const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['customer', 'entrepreneur', 'admin'],
      default: 'customer'
    },
    phone: { type: String, trim: true },
    location: { type: String, trim: true },
    address: { type: String, trim: true },
    bio: { type: String, trim: true },
    skillType: {
      type: String,
      enum: ['cobbler', 'potter', 'tailor', 'artisan', 'small_vendor', 'other'],
      default: 'other'
    },
    skills: [{ type: String, trim: true }],
    experienceYears: { type: Number, default: 0 },
    pricingDetails: { type: String, trim: true },
    availability: { type: String, trim: true, default: 'Available on request' },
    gallery: [{ type: String, trim: true }],
    isVerified: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
