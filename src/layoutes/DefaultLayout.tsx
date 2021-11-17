import {
	CoffeeOutlined,
	ReadOutlined,
	HomeOutlined,
	IdcardOutlined,
	DollarOutlined,
	TeamOutlined,
	SecurityScanOutlined,
} from "@ant-design/icons";
import { Layout, Menu } from "antd";

import ClassDetail from "pages/Classes/classDetail";
import Payment from "pages/Payment";
import Parents from "pages/Parents";
import Roles from "pages/Roles";
import Students from "pages/Students";
import React from "react";
import { useState } from "react";
import { Route, useHistory } from "react-router-dom";
import Classes from "../pages/Classes";
import Employees from "../pages/Employees";
import Home from "../pages/Home";
import Permissions from "../pages/Permissions";
import Users from "../pages/Users";
import TopHeader from "./TopHeader";

const { Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;
function DefaultLayout(): JSX.Element {
	const history = useHistory();
	const [collapsed, setCollapsed] = useState(false);

	return (
		<Layout style={{ minHeight: 1500 }}>
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
				{/* <Menu theme="dark" defaultSelectedKeys={["1"]} mode="inline"> */}
				<Menu theme="dark" mode="inline" defaultSelectedKeys={["1"]}>
					<Menu.Item key="1" icon={<HomeOutlined />} onClick={() => history.push("/")}>
						Trang chủ
					</Menu.Item>
					<Menu.Item key="2" icon={<TeamOutlined />} onClick={() => history.push("/users")}>
						Người dùng
					</Menu.Item>
					<SubMenu key="sub1" icon={<IdcardOutlined />} title="Nhân viên">
						<Menu.Item key="3" onClick={() => history.push("/employees")}>
							Nhân viên
						</Menu.Item>
						<Menu.Item key="4" onClick={() => history.push("/payrolls")}>
							Bảng lương
						</Menu.Item>
					</SubMenu>
					<SubMenu key="sub2" icon={<ReadOutlined />} title="QL học tập">
						<Menu.Item key="5" onClick={() => history.push("/classes")}>
							{" "}
							Lớp học{" "}
						</Menu.Item>
						<Menu.Item key="6" onClick={() => history.push("/students")}>
							Học sinh
						</Menu.Item>
						<Menu.Item key="7" onClick={() => history.push("/parents")}>
							Phụ huynh
						</Menu.Item>
					</SubMenu>
					<SubMenu key="sub3" icon={<DollarOutlined />} title="Thu Chi">
						<Menu.Item key="8" onClick={() => history.push("/payment-slip")}>
							QL Chi tiêu
						</Menu.Item>
						<Menu.Item key="9" onClick={() => history.push("/revenue")}>
							QL doanh thu
						</Menu.Item>
					</SubMenu>
					<SubMenu key="sub4" icon={<SecurityScanOutlined />} title="Phân quyền">
						<Menu.Item key="10" onClick={() => history.push("/permissions")}>
							DS quyền
						</Menu.Item>
						<Menu.Item key="11" onClick={() => history.push("/roles")}>
							Vai trò
						</Menu.Item>
					</SubMenu>
				</Menu>
				{/* <Menu.Item key="5" icon={<LogoutOutlined />} onClick={handleLogout}>
            Logout
          </Menu.Item> */}
				{/* </Menu> */}
			</Sider>
			<Layout className="site-layout">
				<TopHeader onClickMenu={() => setCollapsed(!collapsed)} />
				{/* <Header className="site-layout-background" style={{ padding: 0 }} /> */}
				<Content style={{ margin: "0 16px" }}>
					<Route exact path="/" component={Home} />
					<Route path="/users" component={Users} />
					<Route path="/employees" component={Employees} />
					<Route path="/classes" component={Classes} />
					<Route path="/classes-detail/:class_id" component={ClassDetail} />
					<Route path="/students" component={Students} />
					<Route path="/parents" component={Parents} />
					<Route path="/permissions" component={Permissions} />
					<Route path="/roles" component={Roles} />
					<Route path="/payment-slip" component={Payment} />
				</Content>
				<Footer style={{ textAlign: "center" }}>Ant Design ©2021 Created by Ant UED</Footer>
			</Layout>
		</Layout>
	);
}

export default DefaultLayout;
