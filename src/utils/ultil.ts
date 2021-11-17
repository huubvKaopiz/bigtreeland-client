import numeral from "numeral";

export function formatCurrency(amount: number | string | undefined | null ): string {
	return numeral(amount).format("(0,0 $)");
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function dummyRequest(options: any): void {
	setTimeout(() => {
		if (options.onSuccess) options.onSuccess("ok");
	}, 0);
}
