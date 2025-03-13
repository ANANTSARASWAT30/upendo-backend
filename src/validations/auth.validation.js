const Joi = require('joi');
const {fileSchema} = require('./custom.validation');
const {imageTypes, imgTypeToExtension} = require('../constants');

// Basic registration schema for initial signup
const baseRegisterSchema = {
  email: Joi.string(),
  phone: Joi.string().trim(),
};

// Basic client registration (first step)
const register = {
  body: Joi.object().keys({
    ...baseRegisterSchema,
  }),
};

// Complete profile setup (second step)
const setupProfile = {
  body: Joi.object().keys({
    name: Joi.string().trim().required(),
    gender: Joi.string()
      .trim()
      .valid('male', 'female', 'other', null)
      .required(),
    dob: Joi.string().isoDate(),
    currentLocation: Joi.object().keys({
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required()
    }).allow(null),
    interested: Joi.string()
      .trim()
      .valid('male', 'female', 'other', null),
    relationGoals: Joi.string()
      .trim()
      .valid('Serious Relationship', 'Casual Dating', 'Friendship', 'Not sure yet', null),
    interests: Joi.array().items(Joi.string().trim()),
    bio: Joi.string().max(500),
    height: Joi.number().min(50).max(300),
    weight: Joi.number().min(20).max(500),
    education: Joi.object({
      university: Joi.string().allow(null),
      level: Joi.string().valid(
        'High School', 'In College', 'Bachelors', 'Masters', 'PhD', 'In Grad School', null
      )
    }),
    job: Joi.object({
      title: Joi.string().allow(null),
      companyName: Joi.string().allow(null),
      fieldOfWork: Joi.string().allow(null)
    }),
    language: Joi.array().items(Joi.string()),
    religion: Joi.string().allow(null),
    distance: Joi.string().required(),
    preferences: Joi.object({
      notificationEnabled: Joi.boolean(),
      locationShared: Joi.boolean(),
      locationUpdateFrequency: Joi.string().valid('realtime', 'onDemand', 'never')
    })
  }),
  files: Joi.object().keys({
    photos: Joi.array()
      .items(fileSchema('Photos', imageTypes, Object.values(imgTypeToExtension)))
      .max(10)
      .allow(null),
  })
};

// Admin registration validation
const registerAdmin = {
  body: Joi.object().keys({
    ...baseRegisterSchema,
  }),
  file: fileSchema('Profile Picture', imageTypes, Object.values(imgTypeToExtension))
};

const updateCurrentLocation = {
  body: Joi.object().keys({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required()
  })
};

const generateToken = {
  body: Joi.object().keys({
    uid: Joi.string().required(),
  }),
};

module.exports = {
  generateToken,
  register,
  setupProfile,
  registerAdmin,
  updateCurrentLocation
};