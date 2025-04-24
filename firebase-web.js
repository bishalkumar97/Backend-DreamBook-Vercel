// Import the functions you need from the SDKs you need
const { initializeApp } = require("firebase/app");

const firebaseConfig = {
    apiKey: "AIzaSyBX2nPIiEtWIW9ihNQIikQl1v2_DDt7OJc",
    authDomain: "staging-dream-book.firebaseapp.com",
    projectId: "staging-dream-book",
    storageBucket: "staging-dream-book.firebasestorage.app",
    messagingSenderId: "649205651583",
    appId: "1:649205651583:web:927139a12dce9ab4e8c74a",
    measurementId: "G-PB3LDTG9C2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyDeOim3XtdHSkymypWlseyuWt-o47ekiqw",
//   authDomain: "dream-books-7bbfa.firebaseapp.com",
//   projectId: "dream-books-7bbfa",
//   storageBucket: "dream-books-7bbfa.firebasestorage.app",
//   messagingSenderId: "567740178496",
//   appId: "1:567740178496:web:f7b4b04886ea93715effa5",
//   measurementId: "G-9QE7EEF5ZE"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);