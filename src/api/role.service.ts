import APIService from "api/api.service";
import { AxiosResponse } from "axios";

export default {
	deleteRole<T>(id: T): Promise<AxiosResponse> {
		return APIService.delete(`api/roles/${id}`);
	}
};
