const { User, Admin, Author, Employee } = require('../models');
const emailService = require('./email.service');

async function createUser(user) {
  return User.create(user);
}

async function getUserByFirebaseUId(id) {
  return User.findOne({ firebaseUid: id });
}

async function createAdmin(admin) {
  return await Admin.create(admin)
}

async function createAuthor(author) {
  const newAuthor = await Author.create(author);
  await emailService.sendWelcomeEmail(newAuthor);
  return newAuthor;
}

async function createEmployee(employee) {
  const newEmployee = await Employee.create(employee);
  await emailService.sendWelcomeEmail(newEmployee);
  return newEmployee;
}

// // FIX HERE NEW: Add a new function to fetch authors with search filtering.
// async function getAllAuthors(query, populateConfig) {
//   // If a search parameter exists, build a regex filter on name and email fields.
//   if (query && query.search) {
//     const searchStr = query.search.trim(); // Trim unwanted spaces/newlines
//     const searchRegex = new RegExp(searchStr, 'i'); // Case-insensitive regex
//     query.$or = [
//       { name: searchRegex },
//       { email: searchRegex } // Ensure the Author model has an 'email' field if needed.
//     ];
//     delete query.search; // Remove search key so it doesn't conflict with other filters
//   }
//   // If you use population, apply it here. Otherwise, simply fetch matching authors.
//   return Author.find(query).populate(populateConfig);
// }


module.exports = {
  createUser,
  getUserByFirebaseUId,
  createAdmin,
  createAuthor,
  createEmployee,
  // getAllAuthors
};



