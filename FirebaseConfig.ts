// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDYGLBInbGMq0vacaxI42Wj9LeQ6ljWt6U",
  authDomain: "bridgeland-hs-app.firebaseapp.com",
  projectId: "bridgeland-hs-app",
  storageBucket: "bridgeland-hs-app.appspot.com",
  messagingSenderId: "689249317460",
  appId: "1:689249317460:web:7aa13add6d0a38cf58b3c1",
  measurementId: "G-MH97L2HGB0",
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
