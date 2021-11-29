import React from "react";

export const ArrayEquals = function (
	arrayFirst: string[] | number[] | React.Key[],
	arraySecond: string[] | number[] | React.Key[]
): boolean {
	if (!arraySecond) return false;

	if (arrayFirst.length != arraySecond.length) return false;

	for (let i = 0, l = arrayFirst.length; i < l; i++) {
		if (!arraySecond.some((value) => arrayFirst[i] === value)) return false;
	}
	return true;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const removeEmpty =  function(obj: any): any {
	return Object.fromEntries(
		Object.entries(obj)
			.filter(([_, v]) => v)
			.map(([k, v]) => [k, v === Object(v) ? removeEmpty(v) : v])
	);
}

export function pick<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
    const copy = {} as Pick<T, K>;

    keys.forEach(key => copy[key] = obj[key]);

    return copy;
}
