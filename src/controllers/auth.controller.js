const admin = require('firebase-admin');
const {authService} = require('../services');
const fileUploadService = require('../microservices/fileUpload.service');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const config = require('../config/config');

const createNewUserObject = newUser => ({
  email: newUser.email,
  firebaseUid: newUser.uid,
  isEmailVerified: newUser.isEmailVerified,
  firebaseSignInProvider: newUser.firebase.sign_in_provider,
});

const loginUser = catchAsync(async (req, res) => {
  res.status(httpStatus.OK).json({
    status: true,
    data: req.user,
    message: 'User logged in successfully',
  });
});

// Basic registration with just email/phone
const registerUser = catchAsync(async (req, res) => {
  if (req.user) {
    res.status(httpStatus.CONFLICT).json({
      status: false,
      message: 'User already exists',
      data: req.user,
    });
  } else {
    const userObj = {
      ...createNewUserObject(req.newUser),
      ...req.body, // Storing Firebase Token
    };
    let user = null;
    let profilePic = null;
    
    switch (req.routeType) {
      case 'Client':
        // Create user with just basic info
        user = await authService.createClient({
          ...userObj,
        });
        break;
      case 'Admin':
        user = await authService.createAdmin({
          ...userObj,
        });
        break;
    }
    
    res.status(user ? httpStatus.CREATED : httpStatus.INTERNAL_SERVER_ERROR).json({
      status: !!user,
      message: user ? 'User registered successfully' : 'User registration failed',
      data: user,
    });
  }
});

// Complete profile setup with all dating details
const setupProfile = catchAsync(async (req, res) => {
  if (!req.user || req.user.__t !== 'Client') {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'User not authorized to setup profile');
  }
  
  const userId = req.user._id;
  const profileData = req.body;
  let photos = [];
  
  // Upload photos if provided
  if (req.files && req.files.photos && req.files.photos.length > 0) {
    photos = await fileUploadService.s3Upload(req.files.photos, 'profilePhotos');
  }
  
  // Update user profile with complete details
  const updatedUser = await authService.updateClientProfile(userId, {
    ...profileData,
    photos,
  });
  
  if (!updatedUser) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Profile update failed');
  }
  
  res.status(httpStatus.OK).json({
    status: true,
    message: 'Profile setup completed successfully',
    data: updatedUser,
  });
});

const updateCurrentLocation = catchAsync(async (req, res) => {
  if (!req.user || req.user.__t !== 'Client') {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'User not authorized to update location');
  }
  
  const userId = req.user._id;
  const locationData = {
    latitude: req.body.latitude,
    longitude: req.body.longitude,
    updatedAt: new Date()
  };
  
  const updatedUser = await authService.updateClientLocation(userId, locationData);
  
  res.status(httpStatus.OK).json({
    status: true,
    message: 'Location updated successfully',
    data: updatedUser,
  });
});

const generateToken = catchAsync(async (req, res) => {
  if (config.env !== 'development')
    throw new ApiError(httpStatus.NOT_FOUND, 'Could not find the route you are looking for');

  const token = await admin.auth().createCustomToken(req.body.uid);
  const response = await fetch(
    `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyCustomToken?key=${config.firebase.apiKey}`,
    {
      method: 'post',
      body: JSON.stringify({
        token,
        returnSecureToken: true,
      }),
    }
  );
  const {idToken} = await response.json();

  res.json({
    status: true,
    message: 'Token generated successfully',
    data: {token, idToken},
  });
});


module.exports = {
  generateToken,
  loginUser,
  registerUser,
  setupProfile,
  updateCurrentLocation
};