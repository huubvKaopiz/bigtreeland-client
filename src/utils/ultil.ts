import { FileType } from "interface";
import numeral from "numeral";
import { imageExtensionsList } from "./const";

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

