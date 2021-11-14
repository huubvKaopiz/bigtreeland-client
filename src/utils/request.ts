import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { store } from "../store/store";
import { get } from "lodash";
import { actionLogout } from "store/auth/slice";
import Cookies from "js-cookie";

const apiUrl = process.env.REACT_APP_API;

export default function request(options: AxiosRequestConfig): Promise<AxiosResponse> {
	axios.defaults.baseURL = apiUrl;
	axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
	axios.defaults.headers.common["Content-Type"] = "application/json";

	try {
		const userLogin = JSON.parse(Cookies.get("auth") ?? "");
		const access_token = userLogin.access_token;
		if (access_token) {
			axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
		}
	} catch (error) {
		console.log(error);
	}

	// const user = store.getState().auth.user;
	// const access_token = user?.access_token;
	// if (access_token) {
	// 	axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
	// }

	// axios.interceptors.response.use(
	// 	(response) => response,
	// 	(error) => {
	// 		if (get(error, "response.status", 1) === 401) {
	// 			store.dispatch(actionLogout());
	// 		}
	// 		throw error;
	// 	}
	// );

	return axios(options);
}
