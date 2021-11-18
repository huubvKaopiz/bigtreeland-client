declare global {
	interface Window {
		recaptchaVerifier: any;
		firebase_auth: any;
		confirmationResult: any;
	}
}

import {
	Auth,
	ConfirmationResult,
	getAuth,
	RecaptchaVerifier,
	signInWithPhoneNumber,
} from "firebase/auth";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
	apiKey: process.env.REACT_APP_APIKEY,
	authDomain: process.env.REACT_APP_AUTHDOMAIN,
	projectId: process.env.REACT_APP_PROJECTID,
	storageBucket: process.env.REACT_APP_STORAGEBUCKET,
	messagingSenderId: process.env.REACT_APP_MESSAGINGSENDERID,
	appId: process.env.REACT_APP_APPID,
	measurementId: process.env.REACT_APP_MEASUREMENTID,
};

export const initializeFirebase = (): void => {
	initializeApp(firebaseConfig);
	window.recaptchaVerifier = new RecaptchaVerifier(
		"sign-in-button",
		{
			size: "invisible",
			callback: () => {
				// reCAPTCHA solved, allow signInWithPhoneNumber.
				// onSignInSubmit();
			},
		},
		getAuth()
	);
};
export const auth = (): Auth => getAuth();

export const firebaseVerifyPhone = (phoneNumber: string): Promise<ConfirmationResult> => {
	return signInWithPhoneNumber(getAuth(), phoneNumber, window.recaptchaVerifier);
};
