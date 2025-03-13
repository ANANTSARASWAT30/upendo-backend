const mongoose = require('mongoose');
const {paginate} = require('./plugins/paginate');

const userSchema = new mongoose.Schema(
  {
    email: {type: String, trim: true},
    name: {type: String, trim: true},
    phone: {type: String, trim: true, default: null},
    dob: {type: Date, default: null},
    firebaseUid: {type: String, required: true, unique: true},
    firebaseSignInProvider: {type: String, required: true},
    isBlocked: {type: Boolean, default: false},
    isDeleted: {type: Boolean, default: false},
  },
  {timestamps: true}
);

const clientSchema = new mongoose.Schema(
  {
    gender: {
      type: String,
      enum: ['male', 'female', 'other', null],
      default: null,
    },
    interested: {
      type: String,
      enum: ['male', 'female', 'other', null],
      default: null,
    },
    relationGoals: {
      type: String,
      enum: ['Serious Relationship', 'Casual Dating', 'Friendship', 'Not sure yet', null],
      default: null,
    },
    interests: {
      type: [String],
      default: [],
    },
    bio: {type: String, default: null, maxlength: 500},
    distance: {type: String, default: null},
    height: {type: Number, min: 50, max: 300, default: null},
    weight: {type: Number, min: 20, max: 500, default: null},
    education: {
      university: {type: String, default: null},
      level: {
        type: String,
        enum: ['High School', 'In College', 'Bachelors', 'Masters', 'PhD', 'In Grad School', null],
        default: null,
      },
    },
    job: {
      title: {type: String, default: null},
      companyName: {type: String, default: null},
      fieldOfWork: {type: String, default: null},
    },
    language: {type: [String], default: []},
    religion: {type: String, default: null},
    photos: {
      type: [
        {
          key: String,
          url: String,
        },
      ],
      default: [],
    },
    currentLocation: {
      type: {
        latitude: {type: Number},
        longitude: {type: Number},
        updatedAt: {type: Date, default: Date.now},
      },
      default: null,
    },
    preferences: {
      notificationEnabled: {type: Boolean, default: false},
      locationShared: {type: Boolean, default: false},
      locationUpdateFrequency: {
        type: String,
        enum: ['realtime', 'onDemand', 'never'],
        default: 'onDemand',
      },
    },
  },
  {timestamps: true}
);

const adminSchema = new mongoose.Schema(
  {
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {timestamps: true}
);

userSchema.plugin(paginate);
clientSchema.plugin(paginate);
adminSchema.plugin(paginate);

const User = mongoose.model('User', userSchema);
const Client = User.discriminator('Client', clientSchema);
const Admin = User.discriminator('Admin', adminSchema);

module.exports = {
  User,
  Client,
  Admin,
};
