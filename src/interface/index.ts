export interface RoleType {
	created_at: "2021-11-02T00:50:17.000000Z";
	guard_name: "api";
	id: 1;
	name: "admin";
	updated_at: "2021-11-02T00:50:17.000000Z";
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
}

export interface EmployeeType {
	created_at: "2021-11-02T00:50:17.000000Z";
	deleted_at: null;
	email: "admin@gmail.com";
	email_verified_at: null;
	employee: null;
	id: 1;
	name: "admin";
	parent: null;
	permissions: [];
	roles: RoleType[];
	updated_at: "2021-11-02T00:50:17.000000Z";
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
