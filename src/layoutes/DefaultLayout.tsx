import {
	AppstoreOutlined, CoffeeOutlined, HomeOutlined, IdcardOutlined, SolutionOutlined, TeamOutlined
} from "@ant-design/icons";
import { Layout, Menu } from "antd";
import { useState } from "react";
import { Route, useHistory } from "react-router-dom";
import Classes from "../pages/Classes";
import Employees from "../pages/Employees";
import Home from "../pages/Home";
import Permissions from "../pages/Permissions";
import Users from "../pages/Users";
import TopHeader from "./TopHeader";

const { Content, Footer, Sider } = Layout;

function DefaultLayout(): JSX.Element {
	const history = useHistory();
	const [collapsed, setCollapsed] = useState(false);


	return (
		<Layout>
			<Sider
				breakpoint="lg"
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

				<Menu theme="dark" defaultSelectedKeys={["1"]}>
					{/* <Menu theme="dark" mode="inline" defaultSelectedKeys={["1"]}> */}
					<Menu.Item key="1" icon={<HomeOutlined />} onClick={() => history.push("/")}>
						Trang chủ
					</Menu.Item>
					<Menu.Item key="2" icon={<TeamOutlined />} onClick={() => history.push("/users")}>
						Người dùng
					</Menu.Item>
					<Menu.Item key="3" icon={<IdcardOutlined />} onClick={() => history.push("/employees")}>
						Nhân viên
					</Menu.Item>
					<Menu.Item key="4" icon={<AppstoreOutlined />} onClick={() => history.push("/classes")}>
						Lớp học
					</Menu.Item>
					<Menu.Item key="6" icon={<SolutionOutlined />} onClick={() => history.push("/permissions")}>
						Danh sách quyền
					</Menu.Item>
					
				</Menu>
			</Sider>
			<Layout className="site-layout">
				<TopHeader onClickMenu={() => setCollapsed(!collapsed)} />
				{/* <Header className="site-layout-background" style={{ padding: 0 }} /> */}
				<Content style={{ margin: "0 16px" }}>
					<Route exact path="/" component={Home} />
					<Route path="/users" component={Users} />
					<Route path="/employees" component={Employees} />
					<Route path="/classes" component={Classes} />
					<Route path="/permissions" component={Permissions} />
				</Content>
				<Footer style={{ textAlign: "center" }}>Ant Design ©2021 Created by Ant UED</Footer>
			</Layout>
		</Layout>
	);
}

export default DefaultLayout;
