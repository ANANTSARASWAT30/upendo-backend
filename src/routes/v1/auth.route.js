const express = require('express');

const validate = require('../../middlewares/validate');
const firebaseAuth = require('../../middlewares/firebaseAuth');
const {authValidation} = require('../../validations');
const {fileUploadService} = require('../../microservices');

const {authController} = require('../../controllers');

const router = express.Router();

// Route for logging in a user
router.post('/login', firebaseAuth('All'), authController.loginUser);


// Route for registering a new user
router.post(
  '/register',
  firebaseAuth('Client'),
  fileUploadService.multerUpload.single('profilePic'),
  validate(authValidation.register),
  authController.registerUser
);


// Route for admin secret signup (only admins can access)
router.post(
  '/admin-secretSignup',
  validate(authValidation.register),
  firebaseAuth('Admin'),
  authController.registerUser
);

module.exports = router;
