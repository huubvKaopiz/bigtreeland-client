import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Layout } from "antd";
import Wrapper from "./index.style";

function Home(): JSX.Element {
	// const counter = useSelector((state: RootState) => state.counter);

	// console.log(counter);

	return <Layout.Content style={{ height: "100vh" }}>Home content</Layout.Content>;
}

export default Home;
