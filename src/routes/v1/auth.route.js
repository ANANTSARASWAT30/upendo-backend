const express = require('express');

const validate = require('../../middlewares/validate');
const firebaseAuth = require('../../middlewares/firebaseAuth');
const {authValidation} = require('../../validations');
const {fileUploadService} = require('../../microservices');

const {authController} = require('../../controllers');

const router = express.Router();

// Route for logging in a user
router.post('/login', firebaseAuth('All'), authController.loginUser);

// Step 1: Basic registration route (just email and phone)
router.post(
  '/register',
  firebaseAuth('Client'),
  validate(authValidation.register),
  authController.registerUser
);

// Step 2: Complete profile setup with all details
router.post(
  '/setup-profile',
  firebaseAuth('Client'),
  fileUploadService.multerUpload.fields([
    { name: 'photos', maxCount: 10 }
  ]),
  validate(authValidation.setupProfile),
  authController.setupProfile
);

// Route for updating location
router.put(
  '/location',
  firebaseAuth('Client'),
  validate(authValidation.updateCurrentLocation),
  authController.updateCurrentLocation
);

// Route for admin secret signup (only admins can access)
router.post(
  '/admin-secretSignup',
  validate(authValidation.registerAdmin),
  firebaseAuth('Admin'),
  authController.registerUser
);

// Route to generate token (dev only)
router.post(
  '/generate-token',
  validate(authValidation.generateToken),
  authController.generateToken
);

module.exports = router;