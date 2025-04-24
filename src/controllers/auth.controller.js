const { authService, favouriteService, userService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const generateReferralCode = require("../utils/generateReferralCode")
const admin = require("firebase-admin");


const createNewUserObject = newUser => ({
  name: newUser.name,
  email: newUser.email,
  firebaseUid: newUser.uid,
  profilePic: newUser.picture,
  isEmailVerified: newUser.isEmailVerified,
  firebaseSignInProvider: newUser.firebase.sign_in_provider,
  phone: newUser.phone_number,
});

const loginUser = catchAsync(async (req, res) => {
  res.status(200).send({ status: true, message: "Logged in successfully", data: req.user });
});

const registerUser = catchAsync(async (req, res) => {
  if (req.user) {
    res.status(401).send({ message: 'User already exist' });
    // } else if (!req.newUser.email_verified) {
    //   res.status(401).send({ message: "Email not verified" });
  } else {
    const userObj = {
      ...createNewUserObject(req.newUser),
      ...req.body,
    };
    let user = null;
    switch (req.routeType) {
      case 'User':
        let referralCode = generateReferralCode()
        user = await authService.createUser({ ...userObj, referralCode });
        break;
      case 'Admin':
        user = await authService.createAdmin({ ...userObj, role: 'admin' });
        break;
      default:
        break;
    }
    res.status(201).json({ status: true, message: "User created", data: user });
  }
});

const addAuthor = catchAsync(async (req, res) => {
  let fir = await admin.auth().createUser({
    email: req.body.email,
    password: req.body.password,
  })
  let author = await authService.createAuthor({
    firebaseUid: fir.uid,
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    firebaseSignInProvider: "email",
  })

  res.status(200).send({ status: true, message: "Author added successfully", data: author });
});

const addEmployee = catchAsync(async (req, res) => {
  let fir = await admin.auth().createUser({
    email: req.body.email,
    password: req.body.password,
  })
  let author = await authService.createEmployee({
    firebaseUid: fir.uid,
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    firebaseSignInProvider: "email",
    role: "employee"
  })

  res.status(200).send({ status: true, message: "Author added successfully", data: author });
});

// FIX HERE NEW: New function to fetch authors using a search query
// const getAllAuthorsController = catchAsync(async (req, res) => {
//   // You can add any population config if needed. For now, we pass an empty array.
//   const populateConfig = [];
//   const authors = await getAllAuthors(req.query, populateConfig);
//   res.status(200).json({
//     status: true,
//     message: "All authors retrieved successfully",
//     data: authors,
//   });
// });

// NEW: Function to get all authors based on a search query.
// const getAllAuthorsController = catchAsync(async (req, res) => {
//   // Define any population configuration if needed (or pass an empty array)
//   const populateConfig = [];
//   // Assuming you have a service function to get authors
//   // If you don't have an authorService, you might use a generic one.
//   const authors = await authorService.getAllAuthors(req.query, populateConfig);
//   res.status(200).json({
//     status: true,
//     message: "All authors retrieved successfully",
//     data: authors,
//   });
// });


// NEW: Function to fetch all authors with search filtering.
const getAllAuthors = catchAsync(async (req, res) => {
  // Optionally, set up any population configuration if needed.
  const populateConfig = [];
  // Call the service function to fetch authors based on req.query.
  const authors = await authorService.getAllAuthors(req.query, populateConfig);
  res.status(200).json({
    status: true,
    message: "All authors retrieved successfully",
    data: authors,
  });
});

module.exports = {
  loginUser,
  registerUser,
  addAuthor,
  addEmployee,
  getAllAuthors,
};
