// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore, initializeFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAB5WlKIe0DZcrOvj_MPifrijzq0uBocBQ",
    authDomain: "ledgerly-2ed30.firebaseapp.com",
    projectId: "ledgerly-2ed30",
    storageBucket: "ledgerly-2ed30.firebasestorage.app",
    messagingSenderId: "581938666820",
    appId: "1:581938666820:web:44ea0ff34f2dceae998b11",
    measurementId: "G-68X3C84Q47"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = initializeFirestore(app, {
    ignoreUndefinedProperties: true
});

let analytics;
// Analytics is only supported in browser environments
if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
        if (supported) {
            analytics = getAnalytics(app);
        }
    });
}

export { app, db, analytics };
