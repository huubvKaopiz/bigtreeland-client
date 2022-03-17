import { SmileFilled } from "@ant-design/icons";
import { Layout, Space } from "antd";
import { useState } from "react";
import TopHeader from "./TopHeader";
import LeftMenu from "./LeftMenu";
import Routes from "./Routes";
const { Content, Footer, Sider } = Layout;

function DefaultLayout(): JSX.Element {
	const [collapsed, setCollapsed] = useState(false);

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
