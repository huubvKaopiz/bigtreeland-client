import { ConfigProvider } from "antd";
import { getFireBaseListApp, initializeFirebase } from "lib/fire-base";
import { get } from "lodash";
import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { Provider, useSelector } from "react-redux";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import { actionLogout } from "store/auth/slice";
import { initLib } from "utils/initLib";
import { api } from "utils/request";
import "./i18n";
import "./index.css";
import AuthProvider from "./layoutes/AuthProvider";
import { LoginForm } from "./pages/Login";
import reportWebVitals from "./reportWebVitals";
import { persistor, RootState, store } from "./store/store";

initLib();

ConfigProvider.config({
	theme: {
		primaryColor: "#f98115",
		infoColor: "#109444",
	},
});

function Root() {
	const access_token = useSelector(
		(state: RootState) => state.auth.user?.access_token ?? ""
	);
	if (access_token) {
		api.defaults.headers.common["Authorization"] = "Bearer ".concat(
			access_token
		);
	}

	api.interceptors.response.use(
		(response) => response,
		(error) => {
			if (get(error, "response.status", 1) === 401) {
				store.dispatch(actionLogout());
			}
			throw error;
		}
	);

	useEffect(() => {
		if (!getFireBaseListApp()) {
			console.log("init firebase");
			initializeFirebase();
		}
	}, []);

	return (
		<Router>
			<Switch>
				<Route path="/login" component={LoginForm} />
				<AuthProvider />
			</Switch>
		</Router>
	);
}

ReactDOM.render(
	<React.StrictMode>
		<Provider store={store}>
			<PersistGate loading={null} persistor={persistor}>
				<Root />
			</PersistGate>
		</Provider>
	</React.StrictMode>,
	document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
