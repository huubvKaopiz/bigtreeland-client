import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Layout } from "antd";
import Wrapper from "./index.style";
import io from "socket.io-client";

if (process.env.REACT_APP_SOCKET) {
	window.socket = io(process.env.REACT_APP_SOCKET);
}

function Home(): JSX.Element {
	// const counter = useSelector((state: RootState) => state.counter);

	// console.log(counter);

	useEffect(() => {
		const socket = window.socket;
		if (!socket) return;
		socket.on("message", (res: string) => console.log(res));

		socket.on("connect", () => {
			console.log("socket connected");
		});

		socket.on("disconnect", () => {
			console.log("socket disconnect");
		});
	}, []);

	return <Layout.Content style={{ height: "100vh" }}>Home content</Layout.Content>;
}

export default Home;
