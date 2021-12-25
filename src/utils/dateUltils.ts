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

// func get list of dates in range 
// input: range of date, day in week
export function getDatesInRange(startDate: string, endDate: string, day: number): string[] {
	// day start 0: sun - 6: sat 
	const start = new Date(startDate);
	const end = new Date(endDate);
	const dateList: string[] = [];
	const copyStartDate = new Date(start.getTime())
	const dayInRange = new Date(copyStartDate.setDate(copyStartDate.getDate() + (7 + day - copyStartDate.getDay()) % 7))
	while (dayInRange.getTime() <= end.getTime()) {
		dateList.push(dayInRange.toLocaleDateString())
		dayInRange.setDate(dayInRange.getDate() + 7)
	}
	return dateList
}

export function countSameDates(dateList1: string[], dateList2: string[]): number {
	let res = 0;
	// console.log(dateList1);
	// console.log(dateList2);
	if(dateList1.length == 0 || dateList2.length == 0) return res;
	dateList1.forEach(date1 => {
		dateList2.forEach(date2 => {
			if (moment(date1).isSame(moment(date2))) res++;
		});
	});
	// console.log(res)
	return res;
}
