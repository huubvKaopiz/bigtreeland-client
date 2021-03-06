import { DownOutlined, MenuFoldOutlined } from "@ant-design/icons";
import { Button, Dropdown, Layout, Menu } from "antd";
import { get } from "lodash";
import { EmpProfile } from "pages/Employees/profile";
import { ChangePasswordForm } from "pages/Login/changePasswordForm";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { actionLogout } from "store/auth/slice";
import { RootState } from "store/store";
import styled from "styled-components";

const { Header } = Layout;

const HeaderWrapper = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	height: 100%;
	padding-right: 0.8rem;
	padding-left: 0.8rem;
`;

interface TopHeaderType {
	onClickMenu: () => void;
}

function TopHeader(props: TopHeaderType): JSX.Element {
	const { onClickMenu } = props;
	const dispatch = useDispatch();

	const user = useSelector((state: RootState) => state.auth.user);

	function handleLogout() {
		dispatch(actionLogout());
	}

	return (
		<Header style={{ padding: 0, background: "white" }}>
			<HeaderWrapper>
				<MenuFoldOutlined  className="cursor-pointer" onClick={onClickMenu} />
				<div>
					<Dropdown
						overlay={
							<Menu>
								<Menu.Item key="setting">
									<EmpProfile />
								</Menu.Item>
								<Menu.Item key="change-password">
									<ChangePasswordForm />
								</Menu.Item>
								<Menu.Item key="logout" onClick={handleLogout}>
									<Button type="link">Đăng xuất</Button>
								</Menu.Item>
							</Menu>
						}
						className="mr-2"
					>
						<Button type="text">
							<strong style={{ color: "#e67e22" }}>{get(user, "profile.name", "")}</strong>
							<DownOutlined />
						</Button>
					</Dropdown>
				</div>
			</HeaderWrapper>
		</Header>
	);
}

export default TopHeader;
