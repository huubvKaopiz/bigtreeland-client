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
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { store } from "store/store";

const firebaseConfig = {
	apiKey: import.meta.env.VITE_APIKEY,
	authDomain: import.meta.env.VITE_AUTHDOMAIN,
	projectId: import.meta.env.VITE_PROJECTID,
	storageBucket: import.meta.env.VITE_STORAGEBUCKET,
	messagingSenderId: import.meta.env.VITE_MESSAGINGSENDERID,
	appId: import.meta.env.VITE_APPID,
	measurementId: import.meta.env.VITE_MEASUREMENTID,
};

export const initializeFirebase = (): void => {
	if(getApps().length > 0) return 
	const firebaseApp = initializeApp(firebaseConfig);
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
export const getFireBaseListApp = (): boolean => getApps().length > 0

export const firebaseVerifyPhone = (
	phoneNumber: string
): Promise<ConfirmationResult> => {
	return signInWithPhoneNumber(
		getAuth(),
		phoneNumber,
		window.recaptchaVerifier
	);
};
