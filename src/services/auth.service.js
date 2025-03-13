const {User, Client, Admin} = require('../models');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

async function createUser(user) {
  return await User.create(user);
}

async function createAdmin(admin) {
  return await Admin.create(admin);
}

const createClient = async (data) => {
  if (!Client) {
      throw new Error('Client model is not defined');
  }
  return await Client.create(data);
};

async function getUserByFirebaseUId(id) {
  return await User.findOne({firebaseUid: id});
}

/**
 * Update client profile with complete details
 * @param {ObjectId} userId - The MongoDB ID of the client
 * @param {Object} updateData - Data for profile update
 * @returns {Promise<Client>} Updated client document
 */
const updateClientProfile = async (userId, updateData) => {
  const client = await Client.findById(userId);
  
  if (!client) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Client not found');
  }
  
  // Extract photos from update data
  const { photos, ...otherData } = updateData;
  
  // Map fields to update
  const updateFields = {
    // Basic info
    ...(otherData.name && { name: otherData.name }),
    ...(otherData.dob && { dob: otherData.dob }),
    
    // Dating specific fields
    ...(otherData.gender && { gender: otherData.gender }),
    ...(otherData.interested && { interested: otherData.interested }),
    ...(otherData.relationGoals && { relationGoals: otherData.relationGoals }),
    ...(otherData.interests && { interests: otherData.interests }),
    ...(otherData.bio && { bio: otherData.bio }),
    ...(otherData.height && { height: otherData.height }),
    ...(otherData.weight && { weight: otherData.weight }),
    
    // Education & Job
    ...(otherData.education && { education: otherData.education }),
    ...(otherData.job && { job: otherData.job }),
    
    // Additional info
    ...(otherData.language && { language: otherData.language }),
    ...(otherData.religion && { religion: otherData.religion }),
    
    // User preferences
    ...(otherData.preferences && { preferences: otherData.preferences }),
    
    // Location
    ...(otherData.currentLocation && { currentLocation: otherData.currentLocation }),
  };
  
  // Handle photos upload - add new photos to existing ones
  if (photos && photos.length > 0) {
    updateFields.photos = [...(client.photos || []), ...photos];
    
    // Limit to maximum 10 photos by keeping the most recent ones
    if (updateFields.photos.length > 10) {
      updateFields.photos = updateFields.photos.slice(-10);
    }
  }
  
  // Update the client with the new data
  const updatedClient = await Client.findByIdAndUpdate(
    userId,
    { $set: updateFields },
    { new: true, runValidators: true }
  );
  
  if (!updatedClient) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to update client profile');
  }
  
  return updatedClient;
};

/**
 * Update client location
 * @param {ObjectId} userId - The MongoDB ID of the client
 * @param {Object} locationData - Location data with latitude and longitude
 * @returns {Promise<Client>} Updated client document
 */
const updateClientLocation = async (userId, locationData) => {
  const client = await Client.findById(userId);
  
  if (!client) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Client not found');
  }
  
  if (!locationData || !locationData.latitude || !locationData.longitude) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid location data');
  }
  
  const updatedClient = await Client.findByIdAndUpdate(
    userId,
    { 
      $set: { 
        currentLocation: {
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          updatedAt: locationData.updatedAt || new Date()
        } 
      } 
    },
    { new: true }
  );
  
  if (!updatedClient) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to update client location');
  }
  
  return updatedClient;
};

module.exports = {
  createUser,
  getUserByFirebaseUId,
  createAdmin,
  createClient,
  updateClientProfile,
  updateClientLocation
};