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
			data: params,
		});
	},
	update<T>(resource: string, slug: string, params: T): Promise<AxiosResponse> {
		return request({
			url: `${resource}/${slug}`,
			method: "put",
			data: params,
		});
	},
	put<T>(resource: string, params: T): Promise<AxiosResponse> {
		return request({
			url: resource,
			method: "put",
			data: params,
		});
	},
	delete(resource: string): Promise<AxiosResponse> {
		return request({
			url: resource,
			method: "delete",
		});
	},
};
