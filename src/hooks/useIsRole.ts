import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "store/store";
import { ROLE_NAMES } from "utils/const";

export default function useIsRole(roleName: ROLE_NAMES): boolean {
    const [isRole, setIsRole] = useState<boolean>(false);
    const userInformations = useSelector((state: RootState) => state.auth.user);

    useEffect(() => {
        if (userInformations) {
            setIsRole(!!userInformations.roles.find((role) => role.name === roleName))
        }
    }, [userInformations]);

    return isRole;
}