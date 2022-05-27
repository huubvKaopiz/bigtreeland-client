import { Layout, Space } from "antd";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { actionGetRoles } from "store/roles/slice";
import LeftMenu from "./LeftMenu";
import Routes from "./Routes";
import TopHeader from "./TopHeader";
import React from "react";
const { Content, Footer, Sider } = Layout;

function DefaultLayout(): JSX.Element {
	const [collapsed, setCollapsed] = useState(false);
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(actionGetRoles(0));
	}, [dispatch]);

	return (
		<Layout>
			<Sider
				collapsed={collapsed}
				width="250"
				style={{
					height: "100vh",
					position: "sticky",
					background: "#fff",
					borderRight: "solid 1px",
					borderRightColor: "#ecf0f1",
					top: 0,
					left: 0,
				}}
			>
				<Space
					style={{
						paddingLeft: 20,
						marginBottom: 10,
						marginTop: 10,
						fontWeight: "bold",
						color: "#109444",
						fontSize: "3rem",
					}}
				>
					{collapsed ? "" : "Bigtreeland"}
				</Space>
				<LeftMenu />
			</Sider>

			<Layout className="site-layout">
				<TopHeader onClickMenu={() => setCollapsed(!collapsed)} />

				<Content style={{ padding: "0 16px", backgroundColor: "#fff" }}>
					<Routes />
				</Content>
				<Footer style={{ textAlign: "center", backgroundColor: "#fff" }}>
					Bigtreeland 1.0.0 ©{new Date().getFullYear()} Developed by FreeTeam
				</Footer>
			</Layout>
		</Layout>
	);
}

export default DefaultLayout;
