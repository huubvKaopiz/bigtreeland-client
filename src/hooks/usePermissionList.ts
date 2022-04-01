import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { PermistionType } from "store/permissions/slice";
import { RootState } from "store/store";

export default function usePermissionList(): PermistionType[] {
	const [permissions, setPermissions] = useState<PermistionType[]>([])
	const userInformations = useSelector((state: RootState) => state.auth.user);

    useEffect(() => {
        if(userInformations) {
            const permissionList =  [...userInformations.permissions]
            setPermissions(permissionList)
        }
    }, [userInformations])

	return permissions;
}
