import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export const api = axios.create();
api.defaults.baseURL = import.meta.env.VITE_API;
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
