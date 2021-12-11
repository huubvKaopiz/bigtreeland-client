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
	return moment(strDateInput).format(pattern);
}

export function dateSort(strDateA: string, strDateB: string): number {
	return moment(strDateA).diff(moment(strDateB));
}

export function isBefore(strDateA: string, strDateB: string): boolean {
	return moment(strDateA).isBefore(moment(strDateB));
}

// day param,  0:sun, 1:mon, 2:tue, 3:wed, 4:thu, 5:fri, 6:sat 
export function countDaysInDateRange(from: string, to: string, day: number): number {
	const start = moment(from);
	const end = moment(to); 
	let result = 0;
	const current = start.clone();

	while (current.day(7 + day).isSameOrBefore(end)) {
		// console.log(current.clone());
		result++;
	}

	return result;
}