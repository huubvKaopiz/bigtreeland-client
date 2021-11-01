import request from "utils/request";
import { AxiosResponse } from "axios";


export default {
	query<T>(resource: string, params: T): Promise<AxiosResponse> {
		return request({
			url: resource,
			method: "get",
			params,
		});
	},
	get<T>(resource: string, getParams: T): Promise<AxiosResponse> {
		return request({
			url: resource,
			method: "get",
			params: getParams,
		});
	},
	post<T>(resource: string, params: T): Promise<AxiosResponse> {
		return request({
			url: resource,
			method: "post",
			params,
		});
	},
	update<T>(resource: string, slug: string, params: T): Promise<AxiosResponse> {
		return request({
			url: `${resource}/${slug}`,
			method: "put",
			params,
		});
	},
	put<T>(resource: string, params: T): Promise<AxiosResponse> {
		return request({
			url: resource,
			method: "put",
			params,
		});
	},
	delete(resource: string): Promise<AxiosResponse> {
		return request({
			url: resource,
			method: "delete",
		});
	},
};
