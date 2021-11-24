import { AxiosResponse } from "axios";
import { FileType } from "interface";
import numeral from "numeral";
import { imageExtensionsList } from "./const";
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
