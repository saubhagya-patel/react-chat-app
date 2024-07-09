// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import conf from "../conf/conf";
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: conf.apiKey,
    authDomain: conf.authDomain,
    projectId: conf.projectId,
    storageBucket: conf.storageBucket,
    messagingSenderId: conf.messagingSenderId,
    appId: conf.appId
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage();