import React from "react";
import { Layout, Menu, Breadcrumb } from "antd";
import {
  HomeOutlined,
  TeamOutlined,
  CoffeeOutlined,
  LogoutOutlined,
  IdcardOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { Route, useHistory } from "react-router-dom";
import Users from "../pages/Users";
import Home from "../pages/Home";
import Employees from "../pages/Employees";
import Classes from "../pages/Classes";
import { actionLogout } from "../store/auth/slice";

const { Header, Content, Footer, Sider } = Layout;

function DefaultLayout(): JSX.Element {
  const dispatch = useDispatch();
  const history = useHistory();

  function handleLogout() {
    dispatch(actionLogout());
  }

  return (
    <Layout style={{ minHeight: 1500 }}>
      <Sider>
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
          </Menu>
          <Menu.Item key="5" icon={<LogoutOutlined />} onClick={handleLogout}>
            Logout
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout className="site-layout">
        {/* <Header className="site-layout-background" style={{ padding: 0 }} /> */}
        <Content style={{ margin: "0 16px" }}>
          <Route path="/users" component={Users} />
          <Route path="/employees" component={Employees} />
          <Route path="/classes" component={Classes} />
          <Route exact path="/" component={Home} />
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Ant Design ©2021 Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
  );
}

export default DefaultLayout;
