import React from "react";
import ReactDOM from "react-dom";
import { Provider, useSelector } from "react-redux";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import { initLib } from "utils/initLib";
import { api } from "utils/request";
import "./index.css";
import AuthProvider from "./layoutes/AuthProvider";
import { LoginForm } from "./pages/Login";
import reportWebVitals from "./reportWebVitals";
import { persistor, RootState, store } from "./store/store";
import { get } from "lodash";
import { actionLogout } from "store/auth/slice";
import "./i18n";

initLib();

function Root() {
	const access_token = useSelector((state: RootState) => state.auth.user?.access_token ?? "");
	if (access_token) {
		api.defaults.headers.common["Authorization"] = "Bearer ".concat(access_token);
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
