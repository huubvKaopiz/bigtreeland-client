import APIService from "api/api.service";
import { AxiosResponse } from "axios";

export default {
	getMe(): Promise<AxiosResponse> {
		return APIService.post("api/auth/me", {});
	},
	changePassword<T>(body: T): Promise<AxiosResponse> {
		return APIService.post("api/auth/change-password", body);
	},
	createUser<T>(body: T): Promise<AxiosResponse> {
		return APIService.post("api/user/create-user", body);
	},
	deactiveUser<T>(body: T): Promise<AxiosResponse> {
		return APIService.post("api/user/deactive", body);
	},
};
