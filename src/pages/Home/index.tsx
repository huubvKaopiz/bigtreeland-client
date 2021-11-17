import { Layout } from "antd";
import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { actionUploadFile } from "store/files/slice";
import { useAppDispatch } from "store/store";

if (process.env.REACT_APP_SOCKET) {
	window.socket = io(process.env.REACT_APP_SOCKET);
}

function Home(): JSX.Element {
	const [file, setFile] = useState<FileList | File>();
	const dispatch = useAppDispatch();

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

	return (
		<Layout.Content style={{ height: "100vh" }}>
			Home content
			<input
				type="file"
				multiple
				onChange={(e) => {
					if (e.target.files && e.target.files?.length > 0) {
						setFile(e.target.files);
					}
				}}
			/>
			<button
				onClick={() => {
					if (file) dispatch(actionUploadFile(file))
				}}
			>
				upload file
			</button>
		</Layout.Content>
	);
}

export default Home;
