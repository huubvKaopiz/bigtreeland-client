export function formatCurrency(amount: number|string): string {
	return (+amount).toLocaleString("it-IT", { style: "currency", currency: "VND" });
}
