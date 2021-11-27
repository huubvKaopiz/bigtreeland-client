export interface RevenueType {
	id: number;
	creator_id: number;
	type: 0 | 1 | 2;
	sale_id?: number;
	amount: number;
	note: string | null | undefined;
	date: string;
	status: number;
	created_at: string;
	reason: string;
	creator: any;
	saler?: null| number| string;
}

export interface RevenuesRequestAddType {
	creator_id: number | undefined;
	sale_id?: null| undefined | number;
	amount: number;
	type: number;
	date: string;
	reason?: string;
	note?: string;
	status?: number;
}

export const RevenuesStatusList = [
	"Chưa xử lý",
	"Đã xử lý", 
];

export const RevenuesTypeList = [
    "Học phí/Doanh thu ngoài",
    "Doanh thu sale",
]