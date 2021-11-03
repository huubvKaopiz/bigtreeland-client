import APIService from "api/api.service";
import { AxiosResponse } from "axios";

export default {
	getListPermission(): Promise<AxiosResponse> {
		return APIService.get("api/permissions");
	},
	getListPermissionOfUser(userId: string | number): Promise<AxiosResponse> {
		return APIService.get(`api/permissions/list-permission-of-user/${userId}`);
	},
	setPermissionForUser<T>(body: T): Promise<AxiosResponse> {
		return APIService.post("api/permissions/set-permission-for-user", body);
	},
};
