import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

const apiUrl = process.env.REACT_APP_API;

export const api = axios.create();
api.defaults.baseURL = apiUrl;
api.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
api.defaults.headers.common["Content-Type"] = "application/json";

export default function request(options: AxiosRequestConfig): Promise<AxiosResponse> {
	return api(options);
}

export function uploadFile(file: File | FileList | File[]): Promise<AxiosResponse> {
	const formData = new FormData();
	if (file instanceof File) {
		formData.append("files[]", file);
	} else if (file instanceof FileList) {
		Array.from(file).forEach((f) => {
			formData.append("files[]", f);
		});
	} else {
		file.forEach((f) => {
			formData.append("files[]", f);
		});
	}
	return api.post("api/files", formData, {
		headers: {
			"Content-Type": "multipart/form-data",
		},
	});
}
