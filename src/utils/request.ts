import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { get } from "lodash";

const apiUrl = process.env.REACT_APP_API;

export default function request(options: AxiosRequestConfig): Promise<AxiosResponse> {
	axios.defaults.baseURL = apiUrl;
	axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
	axios.defaults.headers.common["Content-Type"] = "application/json";

	try {
		const store = JSON.parse(localStorage.getItem("persist:root") ?? "");
		const auth = JSON.parse(store.auth ?? "");
		const user = auth.user;
		const access_token = user.access_token;
		if (access_token) {
			axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
		}
	} catch (error) {
		console.log(error);
	}

	axios.interceptors.response.use(
		(response) => response,
		(error) => {
			if (get(error, "response.status", 1) === 401) {
				localStorage.removeItem("persist:root");
				window.location.reload();
			}
			throw error;
		}
	);

	return axios(options);
}
