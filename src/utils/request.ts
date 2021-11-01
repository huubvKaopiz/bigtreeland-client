import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { store } from "../store/store";

const apiUrl = process.env.REACT_APP_API;

export default function request(options: AxiosRequestConfig): Promise<AxiosResponse> {
	axios.defaults.baseURL = apiUrl;
	axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
	axios.defaults.headers.common["Content-Type"] = "application/json";

	const user = store.getState().auth.user;
	const access_token = user?.access_token;
	if (access_token) {
		axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
	}

	return axios(options);
}
