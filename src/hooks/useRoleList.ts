import { RoleType } from "interface";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "store/store";

export default function useRoleList(): RoleType[] {
	const [roles, setRoles] = useState<RoleType[]>([]);
	const userInformations = useSelector((state: RootState) => state.auth.user);

	useEffect(() => {
		if (userInformations) {
			setRoles(userInformations.roles);
		}
	}, [userInformations]);

	return roles;
}
