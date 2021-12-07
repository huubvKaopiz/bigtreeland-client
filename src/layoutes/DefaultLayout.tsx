import { CoffeeOutlined } from "@ant-design/icons";
import { Layout } from "antd";
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
				style={{
					overflow: "auto",
					height: "100vh",
					position: "sticky",
					top: 0,
					left: 0,
				}}
			>
				{!collapsed && (
					<div className="logo" style={{ height: 60 }}>
						<h2 style={{ color: "white", padding: 10 }}>
							<CoffeeOutlined /> <span>Bigtreeland</span>
						</h2>
					</div>
				)}
				<LeftMenu />
			</Sider>
			<Layout className="site-layout">
				<TopHeader onClickMenu={() => setCollapsed(!collapsed)} />
				<Content style={{ padding: "0 16px", backgroundColor: "#fff" }}>
					<Routes />
				</Content>
				<Footer style={{ textAlign: "center", backgroundColor: "#fff" }}>Bigtreeland ©{new Date().getFullYear()}</Footer>
			</Layout>
		</Layout>
	);
}

export default DefaultLayout;
