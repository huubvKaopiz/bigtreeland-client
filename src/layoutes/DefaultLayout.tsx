import { useState } from "react";
import { Layout, Menu, Breadcrumb } from "antd";
import {
	HomeOutlined,
	TeamOutlined,
	CoffeeOutlined,
	LogoutOutlined,
	IdcardOutlined,
	AppstoreOutlined,
	SolutionOutlined,
} from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { Route, useHistory } from "react-router-dom";
import Users from "../pages/Users";
import Home from "../pages/Home";
import Employees from "../pages/Employees";
import Classes from "../pages/Classes";
import Permissions from "../pages/Permissions";
import { actionLogout } from "../store/auth/slice";
import TopHeader from "./TopHeader";

const { Header, Content, Footer, Sider } = Layout;

function DefaultLayout(): JSX.Element {
	const dispatch = useDispatch();
	const history = useHistory();
	const [collapsed, setCollapsed] = useState(false);

	function handleLogout() {
		dispatch(actionLogout());
	}

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
					{/* </Menu> */}
					{/* <Menu.Item key="5" icon={<LogoutOutlined />} onClick={handleLogout}>
						Logout
					</Menu.Item> */}
				</Menu>
			</Sider>
			<Layout className="site-layout">
				<TopHeader name="Admin" onClickMenu={() => setCollapsed(!collapsed)} />
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
