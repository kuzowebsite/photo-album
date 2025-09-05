import { initializeApp } from "firebase/app"
import { getDatabase } from "firebase/database"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyB8JSoULknbkxAJd4L1IJKQTn13hfAsMVU",
  authDomain: "album-d7b36.firebaseapp.com",
  databaseURL: "https://album-d7b36-default-rtdb.firebaseio.com",
  projectId: "album-d7b36",
  storageBucket: "album-d7b36.firebasestorage.app",
  messagingSenderId: "675251970885",
  appId: "1:675251970885:web:74c4d2b8b6605f2958d42c",
  measurementId: "G-VFVNB05Y07",
}

const app = initializeApp(firebaseConfig)
export const database = getDatabase(app)
export const storage = getStorage(app)
