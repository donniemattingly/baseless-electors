// Import FirebaseAuth and firebase.
import React from 'react';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import firebase from 'firebase';

// Configure Firebase.
const config = {
    apiKey: "AIzaSyBInPLRn-BLlJeW8EM0fWBm6BsE3cp3Iec",
    authDomain: "baseless-electors.firebaseapp.com",
    databaseURL: "https://baseless-electors.firebaseio.com",
    projectId: "baseless-electors",
    storageBucket: "baseless-electors.appspot.com",
    messagingSenderId: "1030326177897",
    appId: "1:1030326177897:web:03d7b260ae489d5e6cd2f8"
};

firebase.initializeApp(config);

// Configure FirebaseUI.


const SignIn = () => {

    const uiConfig = {
        // Popup signin flow rather than redirect flow.
        signInFlow: 'popup',
        // Redirect to /signedIn after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
        signInSuccessUrl: '/picks',
        // We will display Google and Facebook as auth providers.
        signInOptions: [
            firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            firebase.auth.EmailAuthProvider.PROVIDER_ID
        ]
    };

    return (
        <div>
            <h1>Democracilicious</h1>
            <p>Please sign-in:</p>
            <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()}/>
        </div>
    );
}

export default SignIn