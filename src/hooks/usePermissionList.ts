import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { PermistionType } from "store/permissions/slice";
import { RootState } from "store/store";
import unionBy from "lodash/unionBy"

export default function usePermissionList(): PermistionType[] {
	const [permissions, setPermissions] = useState<PermistionType[]>([])
	const userInformations = useSelector((state: RootState) => state.auth.user);
	const userRoles = useSelector((state: RootState) => state.roleReducer.roles);

    useEffect(() => {
        if(userInformations) {
            const permissionList =  [...userInformations.permissions]
            userRoles.forEach((role) => {
                if(userInformations.roles.find(r => r.id === role.id)) 
                    permissionList.push(...role.permissions)
            })
            setPermissions(unionBy(permissionList, 'id'))
        }
    }, [userInformations, userRoles])

	return permissions;
}
