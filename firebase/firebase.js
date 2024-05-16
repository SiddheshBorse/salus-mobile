import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCIklXtXgPUgoht3wgOrHriRXFmO4xIcDQ",
  authDomain: "salus-a0631.firebaseapp.com",
  projectId: "salus-a0631",
  storageBucket: "salus-a0631.appspot.com",
  messagingSenderId: "3313572585",
  appId: "1:3313572585:web:d3bd1df225ef2dd40b2e78",
  measurementId: "G-MQ8M629DHS"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {app,db}