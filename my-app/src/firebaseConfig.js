import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
const firebaseConfig = {
    apiKey: "AIzaSyB2hcgo5ZQWg8pN6U3TSG7oh2Lrxglzgk8",
    authDomain: "login-f57f4.firebaseapp.com",
    databaseURL: "https://login-f57f4-default-rtdb.firebaseio.com",
    projectId: "login-f57f4",
    storageBucket: "login-f57f4.appspot.com",
    messagingSenderId: "789802671665",
    appId: "1:789802671665:web:7b56060148f5655cb33f10"
  };
//   // Initialize Firebase
//   firebase.initializeApp(firebaseConfig);
//   export default firebase
// export default firebaseConfig

const app = initializeApp(firebaseConfig);

// Get a reference to the database
const database = getDatabase(app);

export { app, database }; // Export the app and database references