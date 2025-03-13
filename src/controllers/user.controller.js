const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const {userService} = require('../services');


// Controller to handle user update requests
// This controller updates user details (e.g., name, email, etc.)
const updateUser = catchAsync(async (req, res) => {
  const updatedUser = await userService.updateUserById(req.user._id, req.body, req.file);
  res.status(200).send({data: updatedUser, message: 'Your details are updated'});
});

// Controller to handle updating user preferences (e.g., notifications, settings)
const updatePreferences = catchAsync(async (req, res) => {
  const updatedUser = await userService.updatePreferencesById(req.user._id, req.body);
  res.status(200).send({data: updatedUser, message: 'Your preferences are updated'});
});

// Controller for soft-deleting a user (marking the user as deleted but not removing data)
const softDeleteUser = catchAsync(async (req, res) => {
  const {userId} = req.params;

  // Check if the requesting user is an admin or trying to delete their own account
  // Unauthorized users will receive an error
  if (req.user.__t !== 'Admin' && userId !== req.user._id.toString()) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Sorry, you are not authorized to do this');
  }
  await userService.markUserAsDeletedById(req.params.userId);
  res.status(200).send({
    message: 'User has been removed successfully.',
  });
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(200).send({message: 'The user deletion process has been completed successfully.'});
});

module.exports = {
  deleteUser,
  updateUser,
  softDeleteUser,
  updatePreferences,
};
