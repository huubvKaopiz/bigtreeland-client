import React from "react";
import { Button, Layout, Menu, Dropdown } from "antd";
import { DownOutlined, MenuOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
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
	name: string;
	onClickMenu: () => void;
}

function TopHeader(props: TopHeaderType): JSX.Element {
	const { onClickMenu, name } = props;
	const dispatch = useDispatch();
	// const { t, i18n } = useTranslation();

	// function onChangeLanguage(value) {
	// i18n.changeLanguage(value.key);
	// localStorage.setItem(languageKey, value.key);
	// }

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
								<Menu.Item key="logout">
									<span>Logout</span>
								</Menu.Item>
							</Menu>
						}
						className="mr-2"
					>
						<Button>
							<span>{name}</span>
							<DownOutlined />
						</Button>
					</Dropdown>
				</div>
			</HeaderWrapper>
		</Header>
	);
}

export default TopHeader;
