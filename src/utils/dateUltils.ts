import moment from "moment";

export const DatePattern = {
	YYYY_MM_DD: "YYYY/MM/DD",
	YYYY_MM: "YYYY/MM",
	YYYY__MM__DD: "YYYY-MM-DD",
	DD_MM_YYYY_HH_mm_ss: "DD-MM-YYYY HH:mm:ss",
};
export function formatDate(strDateInput: string, pattern: string): moment.Moment | string {
	if (!strDateInput) {
		return "";
	}
	return moment(strDateInput, pattern).format(pattern);
}

export function dateSort(strDateA: string, strDateB: string): number {
	return moment(strDateA).diff(moment(strDateB));
}

export function isBefore(strDateA: string, strDateB: string): boolean {
	return moment(strDateA).isBefore(moment(strDateB));
}
