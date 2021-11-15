import numeral from "numeral";

export function formatCurrency(amount: number | string | undefined | null| typeof NaN): string {
	return numeral(amount).format("(0,0 $)");
}
