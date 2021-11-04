import { DownOutlined, MenuOutlined } from "@ant-design/icons";
import { Button, Dropdown, Layout, Menu } from "antd";
import userService from "api/user.service";
import { PasswordFormProps } from "interface/interfaces";
import ChangePassForm from "pages/Users/ChangePassword";
import React, { useEffect } from "react";
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

	useEffect(() => {
		userService.getMe().then(console.log).catch(console.log).finally();
	}, []);

	function handleLogout() {
		dispatch(actionLogout());
	}

	function handleChangePass(passwordForm: PasswordFormProps) {
		return userService.changePasswordSelf({
			current_password: passwordForm.old_password,
			new_password: passwordForm.new_password,
		});
	}

	return (
		<Header style={{ padding: 0, background: "white" }}>
			<HeaderWrapper>
				<MenuOutlined className="cursor-pointer" onClick={onClickMenu} />
				<div>
					<Dropdown
						overlay={
							<Menu>
								<Menu.Item key="setting">Thay đổi cài đặt</Menu.Item>
								<Menu.Item key="change-password">
									{/* <ChangePassForm handleChangePass={handleChangePass} /> */}
								</Menu.Item>
								<Menu.Item key="logout" onClick={handleLogout}>
									<span>Logout</span>
								</Menu.Item>
							</Menu>
						}
						className="mr-2"
					>
						<Button>
							<span>{user?.name}</span>
							<DownOutlined />
						</Button>
					</Dropdown>
				</div>
			</HeaderWrapper>
		</Header>
	);
}

export default TopHeader;
