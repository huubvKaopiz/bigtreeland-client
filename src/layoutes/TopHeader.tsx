import React from "react";
import { Button, Layout, Menu, Dropdown } from "antd";
import { DownOutlined, MenuOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { actionLogout } from "store/auth/slice";
import { RootState } from "store/store";

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
				<MenuOutlined className="cursor-pointer" onClick={onClickMenu} />
				<div>
					<Dropdown
						overlay={
							<Menu>
								<Menu.Item key="setting">Change setting</Menu.Item>
								<Menu.Item key="change-password">Change password</Menu.Item>
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
