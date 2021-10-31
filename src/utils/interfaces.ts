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
