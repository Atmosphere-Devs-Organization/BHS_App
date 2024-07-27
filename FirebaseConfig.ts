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
  apiKey: "AIzaSyDcj1tg3lbgr197X3z4Jd0tglrikedOmsQ",
  authDomain: "bhs-application-94a8b.firebaseapp.com",
  projectId: "bhs-application-94a8b",
  storageBucket: "bhs-application-94a8b.appspot.com",
  messagingSenderId: "539479021506",
  appId: "1:539479021506:web:42583b3f8e04e56fa6e85b",
  measurementId: "G-PQB94JZEBE",
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
