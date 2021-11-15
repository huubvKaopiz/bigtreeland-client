import React from "react";
import { PermistionType } from "store/permissions/slice";

export interface RoleType {
	created_at: "2021-11-02T00:50:17.000000Z";
	guard_name: "api";
	id: number;
	name: string;
	updated_at: "2021-11-02T00:50:17.000000Z";
	users: UserType[]
	permissions: PermistionType[]
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
	id: 1;
	name: "parent";
	deleted_at: null;
	created_at: null;
	updated_at: null;
	user: {
		id: 3;
		email: "parent@gmail.com";
		phone:string;
		phone_verified_at:string;
	}
	students:{
		id:number;
		name:string;
	}[];
}

export interface ClassType {
	id: 1;
	name: "Lớp tiếng Anh 3";
	schedule:string;
	employee:{id:number, name:number};
	students_num:0;
	sessions_num: 24;
	fee_per_session: 300000;
	start_date: string;
	end_date: string;
	deleted_at: string;
	created_at: "2021-11-06T16:01:41.000000Z";
	updated_at: "2021-11-06T16:01:41.000000Z"
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
	basic_salary: '10000000';
	sales_salary: null;
	working_day: null;
	position: 'Teacher';
	deleted_at: null;
	created_at: '2021-11-03T14:52:10.000000Z';
	updated_at: '2021-11-03T14:52:10.000000Z'
}

export interface EmployeeType {
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
	user:{
		id:number;
		phone:string;
	}
	updated_at: "2021-11-02T00:50:17.000000Z";
	employee_contract:EmployeeContractType;
}

export interface StudentType {
	birthday: "1990-12-14";
    name: "dfsdf";
    admission_date:" 1990-12-14";
	gender: 0;
	class:string;
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
    created_at:" 2021-11-06T05:06:35.000000Z";
    id: 1
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
    path:" http://45.32.101.219:8000/api/students";
    per_page: 20;
    prev_page_url: null;
    to: 1;
    total: 0
}

export interface ListParentType {
	current_page: 1;
    data: ParentType[];
    first_page_url: "http://45.32.101.219:8000/api/parents?page=1";
    from: 1;
    last_page: 1;
    last_page_url: "http://45.32.101.219:8000/api/parents?page=1";
    next_page_url: null;
    path:"http://45.32.101.219:8000/api/parents?page=1";
    per_page: 20;
    prev_page_url: null;
    to: 1;
    total: 0
}

export interface ListClassesType {
	current_page: 1;
    data: ClassType[];
    first_page_url: "http://45.32.101.219:8000/api/parents?page=1";
    from: 1;
    last_page: 1;
    last_page_url: "http://45.32.101.219:8000/api/parents?page=1";
    next_page_url: null;
    path:"http://45.32.101.219:8000/api/parents?page=1";
    per_page: 20;
    prev_page_url: null;
    to: 1;
    total: 0
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


export interface ClassI {
	name: string;
	id:number;
	teacher: {
		id: number;
		name: string;
	};
	sessions_num: number;
	fee_per_session: string;
	students_num: number;
	schedule: string;
}

export interface Attendance {
	student: string;
	birthday: string;
	is_attended: boolean;
}

export interface Parent {
	user_id: number;
	name: string;
}
export interface Student {
	name: string;
	parent: Parent;
	birthday: string;
	gender: number;
	school: string;
	admission_date: string;
	address: string;
	interests: string;
	dislikes: string;
	personality: string;
	hope: string;
	knowledge_status: number;
	is_special: number;
}


export interface OptionType {
	label: string;
	value: string | number;
}

export interface RoleCreateFormType {
	name: string;
	permission_ids: React.Key[];
	user_ids: React.Key[]
}