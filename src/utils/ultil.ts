import { AxiosResponse } from "axios";
import numeral from "numeral";
import { imageExtensionsList, ROLE_NAMES } from "./const";
import request from "./request";

export function formatCurrency(amount: number | string | undefined | null): string {
	return numeral(amount).format("(0,0 $)");
}

export function formatFileSize(size: number | string | undefined | null): string {
	return numeral(size).format("0.0 b");
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function dummyRequest(options: any): void {
	setTimeout(() => {
		if (options.onSuccess) options.onSuccess("ok");
	}, 0);
}

export function isImageType(type: string): boolean {
	return imageExtensionsList.includes(type.toLowerCase());
}

export function downloadFile(urlFile: string, fileName: string): void {
	request({
		url: urlFile,
		method: "GET",
		responseType: "blob",
	}).then((response: AxiosResponse<any>) => {
		const fileURL = window.URL.createObjectURL(new Blob([response.data]));
		const fileLink = document.createElement("a");
		fileLink.href = fileURL;
		fileLink.setAttribute("download", `${fileName}`);
		document.body.appendChild(fileLink);
		fileLink.click();
	});
}


export function converRoleNameToVN(role: ROLE_NAMES): string {
	let res = "";
	switch (role) {
		case ROLE_NAMES.ADMIM:
			res = 'Quản trị hệ thống';
			break;
		case ROLE_NAMES.TEACHER:
			res = "Giáo viên chính thức";
			break;
		case ROLE_NAMES.TEACHER2:
			res = "Giáo viên hợp đồng";
			break;
		case ROLE_NAMES.SALE:
			res = "Nhân viên kinh doanh";
			break;
		case ROLE_NAMES.EMPLOYEE:
			res = "Nhân viên";
			break;
		case ROLE_NAMES.PARENT:
			res = "Phụ huynh";
			break;
		default:
			break;
	}
	return res;
}