import React from "react";
import { PermistionType } from "store/permissions/slice";

export interface RoleType {
	created_at: "2021-11-02T00:50:17.000000Z";
	guard_name: "api";
	id: number;
	name: string;
	updated_at: "2021-11-02T00:50:17.000000Z";
	users: UserType[];
	permissions: PermistionType[];
}

export interface UserType {
	created_at: "2021-11-02T00:50:17.000000Z";
	deleted_at: null;
	email: "admin@gmail.com";
	email_verified_at: null;
	employee: null;
	id: string | number;
	name: "admin";
	parent: null;
	permissions: [];
	roles: RoleType[];
	updated_at: "2021-11-02T00:50:17.000000Z";
	key?: React.Key;
	phone?: number;
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
	user: { id: number; name: number; phone: string };
	employee_id?: number;
	students_num: 0;
	sessions_num: 24;
	fee_per_session: 300000;
	schedule: number[];
	start_date: string;
	end_date: string;
	deleted_at: string;
	created_at: "2021-11-06T16:01:41.000000Z";
	updated_at: "2021-11-06T16:01:41.000000Z";
	act_session_num: 1;
	active_period_tuition?: PeriodTuitionType;
	students?: StudentType[];
}

export interface User {
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
	id: 1;
	employee_id: 2;
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
		id: 1;
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
	name: string;
	employee_contract: EmployeeContractType;
}

export interface StudentType {
	id: 1;
	name: "dfsdf";
	birthday: "1990-12-14";
	admission_date: " 1990-12-14";
	gender: 0;
	class: {
		id: number;
		name: string;
	};
	parent: {
		id: number;
		name: string;
	};
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

export interface ListUserType {
	current_page: 1;
	data: UserType[];
	first_page_url: "http://45.32.101.219:8000/api/users?page=1";
	from: 1;
	last_page: 1;
	last_page_url: "http://45.32.101.219:8000/api/users?page=1";
	next_page_url: null;
	path: "http://45.32.101.219:8000/api/users";
	per_page: 20;
	prev_page_url: null;
	to: 3;
	total: 3;
}

export interface ListEmployeeType {
	current_page: 1;
	data: EmployeeType[];
	first_page_url: "http://45.32.101.219:8000/api/users?page=1";
	from: 1;
	last_page: 1;
	last_page_url: "http://45.32.101.219:8000/api/users?page=1";
	next_page_url: null;
	path: "http://45.32.101.219:8000/api/users";
	per_page: 20;
	prev_page_url: null;
	to: 3;
	total: 3;
}

export interface ListStudentType {
	current_page: 1;
	data: StudentType[];
	first_page_url: "http://45.32.101.219:8000/api/students?page=1";
	from: 1;
	last_page: 1;
	last_page_url: "http://45.32.101.219:8000/api/students?page=1";
	next_page_url: null;
	path: " http://45.32.101.219:8000/api/students";
	per_page: 20;
	prev_page_url: null;
	to: 1;
	total: 0;
}

export interface ListParentType {
	current_page: 1;
	data: ParentType[];
	first_page_url: "http://45.32.101.219:8000/api/parents?page=1";
	from: 1;
	last_page: 1;
	last_page_url: "http://45.32.101.219:8000/api/parents?page=1";
	next_page_url: null;
	path: "http://45.32.101.219:8000/api/parents?page=1";
	per_page: 20;
	prev_page_url: null;
	to: 1;
	total: 0;
}

export interface ListAttendancesType {
	class_id: number;
	class_name: string;
	students: { id: number; name: string; birthday: string }[];
	attendances: { [key: string]: number[] };
}

export interface TestType {
	class_id: number;
	content_files: any[];
	content_link: string;
	created_at: string;
	date: string;
	id: number;
	result_files: any[];
	result_link: string;
	title: string;
	updated_at: string;
}

export interface ListTestType {
	current_page: 1;
	data: TestType[];
	first_page_url: "http://45.32.101.219:8000/api/parents?page=1";
	from: 1;
	last_page: 1;
	last_page_url: "http://45.32.101.219:8000/api/parents?page=1";
	next_page_url: null;
	path: "http://45.32.101.219:8000/api/parents?page=1";
	per_page: 20;
	prev_page_url: null;
	to: 1;
	total: 0;
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
	permission_ids: React.Key[];
	user_ids: React.Key[];
}

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

export interface PeriodTuitionType {
	id: 1;
	class_id: 1;
	est_session_num: 1,
	fee_per_session:number,
	active: 1,
	from_date: "",
	to_date: "",
	lessons?: LessonType[];
	class?: ClassType;
	tuition_fees: TuitionFeeType[];
}

export interface TuitionFeeType {
	id: 1,
	period_tuition_id: 1,
	student_id: 1,
	fixed_deduction: "null",
	flexible_deduction: "null",
	debt: "null",
	note: "null",
	residual: "null",
	status: number,
	from_date: "null",
	to_date: "null",
	est_session_num:number,
	student: {
		id: number,
		name: string,
		birthday: string,
		class_id: number
	},
	period_tuition: {
		id: 3,
		class_id: 4,
		from_date: "2022-01 - 01",
		to_date: "2022 - 01 - 31",
		est_session_num: 13,
		fee_per_session:number,
	}

}

export interface DayoffType {
	id: number;
	from_date: string;
	to_date: string;
}

export interface LessonType {
	id: 1;
	tuition_period_id: 1;
	date: "";
	tuition_period:{
		id:number;
		class:{
			id:number;
			name:string;
		}
	}
}

export interface SalaryType {
	id: 1;
	employee_id: 1;
	basic_salary: "";
	revenue_salary: "";
	debt: "";
	bonus: "";
	fines: "";
	period_id: 1;
	note: "";
	status: number;
	from_date: '',
	to_date: '',
	created_at: '';
	type: number;
	user: {
		id: number;
		name: string;
		phone: string;
	}
}