import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: "imagify-4a61e.firebaseapp.com",
    projectId: "imagify-4a61e",
    storageBucket: "imagify-4a61e.firebasestorage.app",
    messagingSenderId: "383782276069",
    appId: "1:383782276069:web:2f40d871f32114e3833d0c"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
