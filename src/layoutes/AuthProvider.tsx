import { RootState } from "../store/store";
import { useSelector } from "react-redux";
import { Redirect } from "react-router-dom";
import DefaultLayout from "./DefaultLayout";
import React from "react";

export default function AuthProvider(): JSX.Element {
	const user = useSelector((state: RootState) => state.auth.user);

	if (!user) {
		return <Redirect to="/login" />;
	}

	return <DefaultLayout />;
}
