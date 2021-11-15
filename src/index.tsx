import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import { initLib } from "utils/initLib";
import "./index.css";
import AuthProvider from "./layoutes/AuthProvider";
import { LoginForm } from "./pages/Login";
import reportWebVitals from "./reportWebVitals";
import { persistor, store } from "./store/store";

initLib();

ReactDOM.render(
	<React.StrictMode>
		<Provider store={store}>
			<PersistGate loading={null} persistor={persistor}>
				<Router>
					<Switch>
						<Route path="/login" component={LoginForm} />
						<AuthProvider />
					</Switch>
				</Router>
			</PersistGate>
		</Provider>
	</React.StrictMode>,
	document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
