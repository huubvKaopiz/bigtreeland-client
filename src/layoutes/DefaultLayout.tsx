import React from "react";
import {
  HomeOutlined,
  TeamOutlined,
  CoffeeOutlined,
  LogoutOutlined,
  IdcardOutlined,
  AppstoreOutlined,
  SolutionOutlined,
  ContactsOutlined
} from "@ant-design/icons";
import { Layout, Menu } from "antd";
// import { useState } from "react";
import { Route, useHistory } from "react-router-dom";
import Classes from "../pages/Classes";
import Employees from "../pages/Employees";
import Home from "../pages/Home";
import Users from "../pages/Users";
import Permissions from "../pages/Permissions";
// import { actionLogout } from "../store/auth/slice";
import ClassDetail from "pages/Classes/classDetail";
import Students from "pages/Students";

const {Content, Footer, Sider } = Layout;

function DefaultLayout(): JSX.Element {
	const history = useHistory();

  return (
    <Layout style={{ minHeight: 1500 }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div className="logo" style={{ height: 60 }}>
          <h2 style={{ color: "white", padding: 10 }}>
            <CoffeeOutlined /> Bigtreeland
          </h2>
        </div>
        <Menu theme="dark" defaultSelectedKeys={["1"]} mode="inline">
          <Menu theme="dark" mode="inline" defaultSelectedKeys={["1"]}>
            <Menu.Item
              key="1"
              icon={<HomeOutlined />}
              onClick={() => history.push("/")}
            >
              Trang chủ
            </Menu.Item>
            <Menu.Item
              key="2"
              icon={<TeamOutlined />}
              onClick={() => history.push("/users")}
            >
              Người dùng
            </Menu.Item>
            <Menu.Item
              key="3"
              icon={<IdcardOutlined />}
              onClick={() => history.push("/employees")}
            >
              Nhân viên
            </Menu.Item>
            <Menu.Item
              key="4"
              icon={<AppstoreOutlined />}
              onClick={() => history.push("/classes")}
            >
              Lớp học
            </Menu.Item>
            <Menu.Item
              key="5"
              icon={<ContactsOutlined />}
              onClick={() => history.push("/students")}
            >
              Học sinh
            </Menu.Item>
            <Menu.Item
              key="6"
              icon={<SolutionOutlined />}
              onClick={() => history.push("/permissions")}
            >
              Danh sách quyền
            </Menu.Item>
          </Menu>
          {/* <Menu.Item key="5" icon={<LogoutOutlined />} onClick={handleLogout}>
            Logout
          </Menu.Item> */}
        </Menu>
      </Sider>
      <Layout className="site-layout">
        {/* <Header className="site-layout-background" style={{ padding: 0 }} /> */}
        <Content style={{ margin: "0 16px" }}>
          <Route exact path="/" component={Home} />
          <Route path="/users" component={Users} />
          <Route path="/employees" component={Employees} />
          <Route path="/classes" component={Classes} />
          <Route path="/classes-detail" component={ClassDetail} />
          <Route path="/students" component={Students} />
          <Route path="/permissions" component={Permissions} />
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Ant Design ©2021 Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
  );
}

export default DefaultLayout;
