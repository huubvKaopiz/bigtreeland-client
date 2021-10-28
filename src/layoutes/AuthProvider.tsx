import React from "react";
// import { RootState } from "../store/store";
// import { useSelector } from "react-redux";
import { Redirect } from "react-router-dom";
import DefaultLayout from "./DefaultLayout";

export default function AuthProvider(): JSX.Element {
//   const user = useSelector((state: RootState) => state.auth.user);
    const user = {email:"admin"}

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <DefaultLayout />;
}
