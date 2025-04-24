const { User, Admin, Author, Employee } = require('./user.model');
const Book = require("./book.model"); // Update this line

module.exports = {
  User,
  Admin,
  Author,
  Employee,
  Book
};
