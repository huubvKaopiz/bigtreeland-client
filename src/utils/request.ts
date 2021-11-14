import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { get } from "lodash";

const apiUrl = process.env.REACT_APP_API;

export const api = axios.create();

api.defaults.baseURL = apiUrl;
api.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
api.defaults.headers.common["Content-Type"] = "application/json";

export default function request(options: AxiosRequestConfig): Promise<AxiosResponse> {
	return api(options);
}
