const { User, Admin, Author, Employee } = require('../models');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { getAllData } = require("../utils/getAllData");
const { fileUploadService } = require('../microservices');


const userValidator = user => {
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found.');
  }
};

async function getUserById(id) {
  const user = await User.findById(id);
  return user;
}

// async function getUsers(filters, options) {
//   return await User.paginate(filters, options);
// }

// FIX HERE NEW: Updated getUsers function to support a search query parameter.
async function getUsers(filters, options) {
  // Check if a search query parameter exists
  if (filters && filters.search) { // FIX HERE NEW
    const searchStr = filters.search.trim();
    const searchRegex = new RegExp(filters.search, 'i'); // FIX HERE NEW
    // Apply search on multiple fields: name and email (add more if necessary) // FIX HERE NEW
    filters.$or = [
      { name: searchRegex },
      { email: searchRegex }
    ]; // FIX HERE NEW
    // Remove the search key from filters so it doesn't interfere with other filters // FIX HERE NEW
    delete filters.search; // FIX HERE NEW
  }
  return await User.paginate(filters, options);
}

async function updateUserById(id, newDetails, profileImage = null) {
  const user = await User.findById(id);
  userValidator(user);
  let updates = { ...newDetails };
  return await User.findByIdAndUpdate(id, updates, { new: true });

}

async function updateAuthor(id, newDetails) {
  const user = await User.findById(id);
  userValidator(user);
  let updates = { ...newDetails };
  return await Author.findByIdAndUpdate(id, updates, { new: true });

}

async function updateEmployee(id, newDetails) {
  const user = await User.findById(id);
  userValidator(user);
  let updates = { ...newDetails };
  return await Employee.findByIdAndUpdate(id, updates, { new: true });

}

async function deleteUserById(id) {
  try {
    await User.findByIdAndDelete(id);
    return true;
  } catch (err) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete the user');
  }
}

async function updatePreferencesById(id, newPrefs) {
  const user = await User.findById(id);
  user.preferences = {
    ...user.preferences,
    ...newPrefs,
  };
  // any other fields if you have
  await user.save();
  return user;
}

// async function getAllUsers(query, populateConfig) {
//   const data = await getAllData(User, query, populateConfig)
//   return data;
// }

async function getAllUsers(query, populateConfig) {
  // FIX HERE NEW: Add search filter if query.search exists
  if (query && query.search) { // FIX HERE NEW
    const searchStr = query.search.trim();
    const searchRegex = new RegExp(query.search, 'i'); // FIX HERE NEW
    query.$or = [ // FIX HERE NEW
      { name: searchRegex }, // FIX HERE NEW
      { email: searchRegex } // FIX HERE NEW
    ]; // FIX HERE NEW
    delete query.search; // FIX HERE NEW
  }

  // FIX HERE NEW: Handle status filter
  // If 'status' is provided and is not 'All', we filter by that status
  if (query && query.status && query.status !== 'All') { // FIX HERE NEW
    query.status = query.status.trim(); // optional trim
  } else if (query && query.status === 'All') {
    delete query.status; // remove status from query to get all
  }

  console.log("Final query passed to getAllData:", query); // FIX HERE NEW: Debug log
  const data = await getAllData(User, query, populateConfig);
  return data;
}



module.exports = {
  getUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  updatePreferencesById,
  getAllUsers,
  updateAuthor,
  updateEmployee
};
