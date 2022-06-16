import React from "react";
import { PermistionType } from "store/permissions/slice";

export interface GetResponseType<T = unknown> {
	current_page?: number;
	data?: T[];
	first_page_url?: string;
	from?: number;
	last_page?: number;
	last_page_url?: string;
	next_page_url?: string;
	path?: string;
	per_page?: number;
	prev_page_url?: string;
	to?: number;
	total?: number;
}

export interface RoleType {
	created_at: "2021-11-02T00:50:17.000000Z";
	guard_name: "api";
	description: string;
	id: number;
	name: string;
	updated_at: "2021-11-02T00:50:17.000000Z";
	users: UserType[];
	permissions: PermistionType[];
	menues?: number[];
}

export interface UserType {
	created_at: "2021-11-02T00:50:17.000000Z";
	deleted_at: null;
	email: "admin@gmail.com";
	phone_verified_at: null;
	employee: null;
	id: number;
	name: "admin";
	parent: null;
	permissions: PermistionType[];
	roles: RoleType[];
	updated_at: "2021-11-02T00:50:17.000000Z";
	key?: React.Key;
	phone?: number;
	profile?: {
		id: 1;
		name: "parent";
		email: "parent@gmail.com";
		birthday: string;
		deleted_at: null;
		created_at: null;
		updated_at: null;
	};
}

export interface ParentType {
	profile: {
		id: 1;
		name: "parent";
		email: "parent@gmail.com";
		deleted_at: null;
		created_at: null;
		updated_at: null;
	};
	id: 3;
	phone: string;
	phone_verified_at: string;
	name: string;
	students: {
		id: number;
		name: string;
	}[];
}

export interface ClassType {
	id: 1;
	name: "Lớp tiếng Anh 3";
	type: number; // 0 offline, 1 online
	user: { id: number; phone: string; profile: { name: string } };
	employee_id?: number;
	students_num: 0;
	fee_per_session: 300000;
	schedule: number[];
	schedule_time: string;
	start_date: string;
	end_date: string;
	deleted_at: string;
	created_at: "2021-11-06T16:01:41.000000Z";
	updated_at: "2021-11-06T16:01:41.000000Z";
	act_session_num: 1;
	active_period_tuition?: PeriodTuitionType;
	period_tuition_lastest?:PeriodTuitionType;
	students?: StudentType[];
	assistant_id: number | null;
	assistant: UserType;
}

export interface User {
	id: number;
	email: string;
	phone: string;
	role: string;
}
export interface PasswordFormProps {
	old_password: string;
	new_password: string;
	confirm_new_password: string;
}
export interface Permission {
	id: number;
	name: string;
	guard_name: string;
	created_at: string;
	updated_at: string;
}
export interface AddNewUser {
	email: string;
	phone: string;
	password: string;
	role?: string;
	name?: string;
	address?: string;
}

export interface EmployeeContractType {
	id: number;
	employee_id: number;
	basic_salary: "10000000";
	sales_salary: null;
	working_day: null;
	position: "Teacher";
	deleted_at: null;
	created_at: "2021-11-03T14:52:10.000000Z";
	updated_at: "2021-11-03T14:52:10.000000Z";
}

export interface EmployeeType {
	profile: {
		created_at: "2021-11-02T00:50:17.000000Z";
		deleted_at: null;
		email: "admin@gmail.com";
		email_verified_at: null;
		employee: null;
		id: number;
		name: "admin";
		address: "1";
		birthday: "2021-12-14";
		gender: 0;
		interests: "1";
		dislikes: "2";
		updated_at: "2021-11-02T00:50:17.000000Z";
	};
	id: number;
	phone: string;
	employee_contract: EmployeeContractType;
}

export interface StudentType {
	id: number;
	name: "dfsdf";
	birthday: "1990-12-14";
	admission_date: " 1990-12-14";
	gender: number;
	class: {
		id: number;
		name: string;
	};
	parent: {
		id: number;
		name: string;
		phone:string;
		profile: {
			name: string;
		}
	};
	class_histories: {
		id: number;
		class_id: number;
		date: string
	}[];
	type: number; // 0 offline, 1 online
	school: null;
	address: null;
	interests: null;
	dislikes: null;
	personality: null;
	hope: null;
	knowledge_status: null;
	is_special: false;
	parent_id: 2;
	updated_at: "2021-11-06T05:06:35.000000Z";
	created_at: " 2021-11-06T05:06:35.000000Z";
}

export interface ListAttendancesType {
	class_id: number;
	class_name: string;
	students: StudentType[];
	attendances: {
		[key: string]: {
			comment: string;
			conduct_point: number;
			reminder: string;
			student_id: number;
			student_name: string;
		}[];
	};
	students_num?: number;
}

export interface TestType {
	class_id: number
	content_files: FileType[]
	content_link: string
	created_at: string
	date: string
	id: number
	description: string | null
	result_files: FileType[]
	result_link: string
	title: string
	updated_at: string
	lesson_id?: number
	test_results: TestResultsType[]
	lesson:{
		id: number,
		date: string, 
		name: string,
	}
	class: {
		id: number;
		name: string;
		schedule: number[];
		schedule_time: string;
		students_num: number
	}
}

export interface FileType {
	created_at: "2021-11-22 21:49:31";
	id: 33;
	name: "2021-10-27 22.17.39.jpg";
	size: "171530";
	type: string;
	updated_at: "2021-11-22 21:49:31";
	url: "https://bigtreeland-dev.s3.ap-southeast-1.amazonaws.com/1/bYAFsowgj1zCHCzoupoSWot0Ca8RC0Ww6r8TKFv9.jpg?X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAY35R6B4DJFINQX5H%2F20211122%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20211122T144931Z&X-Amz-SignedHeaders=host&X-Amz-Expires=10800&X-Amz-Signature=945df7794e5ac8094babbe38a91abff94fbb3bcd8fd2ca8653093000e7de1241";
	user_id: 1;
}

export interface Employee {
	name: "Tran Thi Nham";
	birthday: "26/03/1992";
	address: "101E1 Thanh Xuan Bac Thanh Xuan HN";
	phone: "0363723154";
	gender: 0;
	interests: "";
	dislikes: "";
}

export interface Attendance {
	student: string;
	birthday: string;
	is_attended: boolean;
}

export interface OptionType {
	label: string;
	value: string | number;
}

export interface RoleCreateFormType {
	name: string;
	description: string;
	permission_ids: React.Key[];
	user_ids: React.Key[];
}



export interface PeriodTuitionType {
	id: number;
	class_id: number;
	est_session_num: number;
	fee_per_session: number;
	active: number;
	from_date: "";
	to_date: "";
	dayoffs: string[];
	lessons?: LessonType[];
	class?: ClassType;
	tuition_fees: TuitionFeeType[];
}

export interface TuitionFeeType {
	id: number;
	period_tuition_id: number;
	student_id: number;
	fixed_deduction: "null";
	flexible_deduction: "null";
	prev_debt: "null";
	note: "null";
	residual: "null";
	status: number;
	from_date: "null";
	to_date: "null";
	est_session_num: number;
	paid_amount: string;
	dayoffs: string[];
	student: {
		id: number;
		name: string;
		birthday: string;
		class_id: number;
		class?: ClassType;
	};
	period_tuition: {
		id: 3;
		class_id: 4;
		from_date: "2022-01 - 01";
		to_date: "2022 - 01 - 31";
		est_session_num: 13;
		fee_per_session: number;
		dayoffs: string[];
	};
}

export interface DayoffType {
	id: number;
	from_date: string;
	to_date: string;
}

export interface LessonType {
	id: number;
	tuition_period_id: number;
	title: string;
	date: "";
	assistant_id:number | null;
	lesson_feedback: {
		id: number;
		parent_id: number;
		feedback: string;
		parent: {
			phone: string
		}
	}[];
	review_lessons: {
		reviewed: number;
		student_id: number;
	}[];
	attendances: {
		id: number;
		student_id: number;
		comment: string;
		conduct_point: string;
		reminder: string;
	}[];
	tuition_period: {
		id: number;
		from_date: string;
		to_date: string;
		class: {
			id: number;
			name: string;
		}
	}
	tests: TestType[];
}

export interface SalaryType {
	id: number;
	employee_id: number;
	basic_salary: "";
	revenue_salary: "";
	debt: "";
	bonus: "";
	fines: "";
	period_id: number;
	note: "";
	status: number;
	from_date: "";
	to_date: "";
	created_at: "";
	type: number;
	user: {
		id: number;
		name: string;
		phone: string;
		profile: {
			name: string;
		}
	};
}

export interface StudySummaryType {
	id: number;
	class_id: number;
	from_date: string;
	to_date: string;
	class?: {
		id: number;
		name: number;
		students_num: number;
	};
}

export interface SystemSettingsType {
	name: string,
	address: string,
	phone: string,
	email: string,
	logo_file: {
		id: number,
		url: string,
	},
	permission_configuration_file: {
		id: number,
		url: string,
	}
}
export interface User {
	email: string;
	phone: string;
	role: string;
}

export interface Permission {
	id: number;
	name: string;
	guard_name: string;
	created_at: string;
	updated_at: string;
	description?: string | null;
}

export interface AddNewUser {
	email: string;
	phone: string;
	password: string;
	role?: string;
	name?: string;
	address?: string;
}

export interface NewsType {
	id: number;
	employee_id: number;
	title: string;
	photo: FileType;
	content: string;
	created_at: "2022-02-09 15:57:42";
	creator: {
		id: number;
		phone: string;
		name: string;
	}
}

export interface NotificationType {
	user_ids: number[],
	data: {
		title: string;
		body: string;
		to: string
	}[];
}

export interface GiftType {
	id: number;
	name: string;
	type: number;
	photo: FileType;
	description: string;
	status: number;
	quantity: number;
	condition_point: string;
}

export interface StudentGiftType {
	study_summary_board_id: number;
	student_id: number;
	gift_id: number;
	status: number;
	student: {
		id: number;
		name: number;
		birtday: string;
	};
	gift: GiftType;
}

export interface ClassPhotoType {
	id: number;
	class_id: number;
	file_id: number;
	created_at: string;
	file: {
		name: string;
		url: string;
	}
}

export interface StudentStatType {
	total_student: { [key: string]: number };
	total_student_off: { [key: string]: number };
	total: number;
}

export interface TestResultsType {
	id: number
	student_id: number
	test_id: number
	result_files: FileType[]
	result_link: number | null
	correct_files: FileType[]
	correct_link: string
	point: string
	teacher_comment: string
	parent_feedback: string
	updated_at: string
	student: StudentType,
	test: TestType,
}

export interface BirthdayListType {
	students: StudentType[];
	users: UserType[];
}

export interface DocumentType {
	id: number
	title: string
	class_id: number
	link: string
	files: FileType[]
	created_at: string
}

export interface AttendanceType {
	id:number;
	student_id:number;
	lesson_id:number;
	comment:string;
	conduct_point: number;
	reminder:string;
	lesson:{
		id:number;
		tuition_period_id: number;
		date:string;
		class_id:number;
		assistant_id: number | null;
		employee_id: number;
	}
}
export interface StudentSummaryBoardType {
	id:number;
	name:string;
	test_results:TestResultsType[];
	attendances:AttendanceType[];
}	
