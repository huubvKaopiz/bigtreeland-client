import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "store/store";
import { ROLE_NAMES } from "utils/const";

export default function useIsAdmin(): boolean {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const userInformations = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if(userInformations) {
        setIsAdmin(!!userInformations.roles.find((role) => role.name === ROLE_NAMES.ADMIM))
    } 
  }, [userInformations]);

  return isAdmin;
}