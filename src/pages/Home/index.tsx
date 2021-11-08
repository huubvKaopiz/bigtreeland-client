import { Layout } from "antd";
import React, { useEffect } from "react";
import io from "socket.io-client";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { initializeApp } from "firebase/app";

declare global {
	interface Window {
		recaptchaVerifier: any;
	}
}

if (process.env.REACT_APP_SOCKET) {
	window.socket = io(process.env.REACT_APP_SOCKET);
}

function Home(): JSX.Element {
	// const counter = useSelector((state: RootState) => state.counter);

	// console.log(counter);

	function getPhoneNumberFromUserInput() {
		return "+84337639659";
	}

	// useEffect(() => {
	// 	const firebaseConfig = {
	// 		apiKey: "AIzaSyCora6Am-_ZgG5eZujPsxjgBn8SzTf0zzA",
	// 		authDomain: "bigtreeland-780da.firebaseapp.com",
	// 		projectId: "bigtreeland-780da",
	// 		storageBucket: "bigtreeland-780da.appspot.com",
	// 		messagingSenderId: "113408851209",
	// 		appId: "1:113408851209:web:666940246bc162986f27d8",
	// 		measurementId: "G-KG1VB3CFSS",
	// 	};

	// 	const app = initializeApp(firebaseConfig);
	// 	console.log(app);

	// 	const auth = getAuth();

	// 	window.recaptchaVerifier = new RecaptchaVerifier(
	// 		"sign-in-button",
	// 		{
	// 			size: "invisible",
	// 			callback: (response: any) => {
	// 				console.log(response);
	// 				// reCAPTCHA solved, allow signInWithPhoneNumber.
	// 				// onSignInSubmit();
	// 			},
	// 		},
	// 		auth
	// 	);

	// 	const phoneNumber = getPhoneNumberFromUserInput();
	// 	const appVerifier = window.recaptchaVerifier;

	// 	signInWithPhoneNumber(auth, phoneNumber, appVerifier)
	// 		.then((confirmationResult) => {
	// 			const code = window.prompt("code") as string;

	// 			confirmationResult
	// 				.confirm(code)
	// 				.then((result) => {
	// 					// User signed in successfully.
	// 					const user = result.user;
	// 					console.log(user);
	// 					// ...
	// 				})
	// 				.catch((error) => {
	// 					console.log(error);
	// 					// User couldn't sign in (bad verification code?)
	// 					// ...
	// 				});

	// 			// console.log(confirmationResult);
	// 			// SMS sent. Prompt user to type the code from the message, then sign the
	// 			// user in with confirmationResult.confirm(code).
	// 			// window.confirmationResult = confirmationResult;
	// 			// ...
	// 			// const code = pro
	// 		})
	// 		.catch((error) => {
	// 			console.log(error);
	// 			// Error; SMS not sent
	// 			// ...
	// 		});
	// }, []);

	useEffect(() => {
		const socket = window.socket;
		if (!socket) return;
		socket.on("message", (res: string) => console.log(res));

		socket.on("connect", () => {
			console.log("socket connected");
		});

		socket.on("disconnect", () => {
			console.log("socket disconnect");
		});
	}, []);

	return (
		<Layout.Content style={{ height: "100vh" }}>
			Home content <div id="sign-in-button"></div>
		</Layout.Content>
	);
}

export default Home;
