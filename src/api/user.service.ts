import APIService from "api/api.service";
import { AxiosResponse } from "axios";

export default {
	getMe(): Promise<AxiosResponse> {
		return APIService.post("api/auth/me", {});
	},
	changePasswordOfUser<T>(body: T): Promise<AxiosResponse> {
		return APIService.post("api/auth/change-password-of-user", body);
	},
	changePasswordSelf<T>(body: T): Promise<AxiosResponse> {
		return APIService.post("api/auth/change-password-of-user", body);
	},
	createUser<T>(body: T): Promise<AxiosResponse> {
		return APIService.post("api/users", body);
	},
	deactiveUser<T>(userId: T): Promise<AxiosResponse> {
		return APIService.delete(`api/users/${userId}`);
	},
};
