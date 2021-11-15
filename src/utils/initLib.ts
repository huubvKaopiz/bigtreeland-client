import numeral from "numeral";

function initNumeral(): void {
	numeral.register("locale", "vi", {
		delimiters: {
			thousands: ",",
			decimal: ".",
		},
		abbreviations: {
			thousand: "k",
			million: "m",
			billion: "b",
			trillion: "t",
		},
		ordinal: function (number) {
			return number === 1 ? "" : "";
		},
		currency: {
			symbol: "VND",
		},
	});
	numeral.locale("vi");
}

export function initLib(): void {
	initNumeral();
}
