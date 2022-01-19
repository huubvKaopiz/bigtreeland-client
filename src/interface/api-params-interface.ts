export interface UpdateRoleDataType {
	role_id: number | undefined;
	role_name?: string;
	add_user_ids?: React.Key[];
	remove_users_ids?: React.Key[];
	permission?: undefined | { added: React.Key[]; removed: React.Key[] };
}
