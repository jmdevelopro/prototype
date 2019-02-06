 
 import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/storage';
 
 // Initialize Firebase
 var config = {
    apiKey: "AIzaSyDc2aR8-dG24niY-LftjttPHRFy2NAZhmQ",
    authDomain: "react-slack-clone-4fe9c.firebaseapp.com",
    databaseURL: "https://react-slack-clone-4fe9c.firebaseio.com",
    projectId: "react-slack-clone-4fe9c",
    storageBucket: "react-slack-clone-4fe9c.appspot.com",
    messagingSenderId: "454994613723"
  };
  firebase.initializeApp(config);

  export default firebase;