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
