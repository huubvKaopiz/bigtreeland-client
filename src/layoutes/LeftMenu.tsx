import {
	ReadOutlined,
	LineChartOutlined,
	IdcardOutlined,
	DollarOutlined,
	TeamOutlined,
	ApartmentOutlined,
	FileOutlined,
	SettingOutlined,
	SnippetsOutlined,
	GiftOutlined
} from "@ant-design/icons";
import { Menu } from "antd";
import { RoleType } from "interface";
import { get, isArray, isString } from "lodash";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import { RootState } from "store/store";
import { leftMenu, MenuList } from "utils/leftMenu";

const { SubMenu } = Menu;

function LeftMenu(): JSX.Element {
	const history = useHistory();
	const userStore = useSelector((state: RootState) => state.auth.user);
	const [selectedKeys, setSelectedKeys] = useState([""]);
	const [openKeys, setOpenKeys] = useState([""]);
	const location = useLocation();
	const pathname = location.pathname;
	const [menuItemGranted, setMenuItemGranted] = useState<number[]>([]);

	useEffect(() => {

		//user
		if (pathname.includes("/users") || pathname.includes("/user-set-permissions/")) {
			setOpenKeys([""]);
			setSelectedKeys(["2"]);
			return;
		}
		//employees
		if (pathname.includes("/employees")) {
			setOpenKeys(["employees"]);
			setSelectedKeys(["3"]);
			return;
		}
		if (pathname.includes("/salaries") || pathname.includes("/salaries-create")) {
			setOpenKeys(["employees"]);
			setSelectedKeys(["4"]);
			return;
		}
		// study
		if (pathname.includes("/classes") || pathname.includes("/study")) {
			setOpenKeys(["classes"]);
			setSelectedKeys(["5"]);
			return;
		}
		if (pathname.includes("/students") || pathname.includes("/students-study-profile")) {
			setOpenKeys(["classes"]);
			setSelectedKeys(["6"]);
			return;
		}
		if (pathname.includes("/parents")) {
			setOpenKeys(["classes"]);
			setSelectedKeys(["7"]);
			return;
		}
		if (pathname.includes("/study-summary") || pathname.includes("/study-summary-detail")) {
			setOpenKeys(["classes"]);
			setSelectedKeys(["8"]);
			return;
		}
		// payment slip
		
		if (pathname.includes("/payments/payment-slips")) {
			setOpenKeys(["payments"]);
			setSelectedKeys(["9"]);
			return;
		}
		if (pathname.includes("/payments/revenue")) {
			setOpenKeys(["payments"]);
			setSelectedKeys(["10"]);
			return;
		}
		if (pathname.includes("payments/tuition")) {
			setOpenKeys(["payments"]);
			setSelectedKeys(["11"]);
			return;
		}
		if (pathname.includes("/payments")) {
			setOpenKeys(["payments"]);
			return;
		}
		//news
		if (pathname.includes("/news")) {
			setSelectedKeys(["12"]);
			return;
		}

		//gift
		if (pathname.includes("/gifts")) {
			setSelectedKeys(["13"]);
			return;
		}
		//roles
		if (pathname.includes("/roles")) {
			setOpenKeys(["permissions"]);
			setSelectedKeys(["14"]);
			return;
		}
		//files
		if (pathname.includes("/files")) {
			setSelectedKeys(["15"]);
			return;
		}
		//settings
		if (pathname.includes("/settings")) {
			setSelectedKeys(["16"]);
			return;
		}

		// home
		if (pathname.includes("/")) {
			setOpenKeys([""]);
			setSelectedKeys(["1"]);
			return;
		}

	}, [pathname]);
	// console.log(pathname, selectedKeys)

	useEffect(() => {
		const menuItem: number[] = [];
		get(userStore, "roles", []).map(({ id, menues }: RoleType) => {
			// admin === 1
			console.log(menues)
			if (id === 1) {
				menuItem.push(...MenuList.map((menu) => menu.value));
			} else {
				if (isString(menues) && menues.length > 2) {
					const menuList = `${menues}`
						.substring(1, `${menues}`?.length - 1)
						.split(",")
						.map((menu) => +menu);
					menuItem.push(...menuList);
				} else if (isArray(menues)) {
					if (menues) menuItem.push(...menues);
				}
			}
		});
		setMenuItemGranted([...new Set(menuItem)]);
	}, [userStore]);

	return (
		<Menu
			mode="inline"
			selectedKeys={selectedKeys}
			openKeys={openKeys}
			style={{borderRight:'none'}}
		>
			{menuItemGranted.includes(1) && (
				<Menu.Item
					key="1"
					icon={<LineChartOutlined />}
					onClick={() => history.push("/")}
				>
					Trang chủ
				</Menu.Item>
			)}
			{menuItemGranted.includes(2) && (
				<Menu.Item
					key="2"
					icon={<TeamOutlined />}
					onClick={() => history.push("/users")}
				>
					Người dùng
				</Menu.Item>
			)}
			{(menuItemGranted.includes(3) || menuItemGranted.includes(4)) && (
				<SubMenu
					onTitleClick={() => setOpenKeys(["employees"])}
					key="employees"
					icon={<IdcardOutlined />}
					title="Nhân viên"
				>
					{menuItemGranted.includes(3) && (
						<Menu.Item key="3" onClick={() => history.push("/employees")}>
							Nhân viên
						</Menu.Item>
					)}
					{menuItemGranted.includes(4) && (
						<Menu.Item key="4" onClick={() => history.push("/salaries")}>
							Bảng lương
						</Menu.Item>
					)}
				</SubMenu>
			)}
			{(menuItemGranted.includes(5) ||
				menuItemGranted.includes(6) ||
				menuItemGranted.includes(7) ||
				menuItemGranted.includes(8)) && (
					<SubMenu
						onTitleClick={() => setOpenKeys(["classes"])}
						key="classes"
						icon={<ReadOutlined />}
						title="QL học tập"
					>
						{menuItemGranted.includes(5) && (
							<Menu.Item key="5" onClick={() => history.push("/classes")}>
								Lớp học
							</Menu.Item>
						)}
						{menuItemGranted.includes(6) && (
							<Menu.Item key="6" onClick={() => history.push("/students")}>
								Học sinh
							</Menu.Item>
						)}
						{menuItemGranted.includes(7) && (
							<Menu.Item key="7" onClick={() => history.push("/parents")}>
								Phụ huynh
							</Menu.Item>
						)}
						{menuItemGranted.includes(8) && (
							<Menu.Item key="8" onClick={() => history.push("/study-summary")}>
								Bảng tổng kết
							</Menu.Item>
						)}
					</SubMenu>
				)}
			{(menuItemGranted.includes(9) ||
				menuItemGranted.includes(10) ||
				menuItemGranted.includes(11)) && (
					<SubMenu
						onTitleClick={() => setOpenKeys(["payments"])}
						key="payments"
						icon={<DollarOutlined />}
						title="Thu Chi"
					>
						{menuItemGranted.includes(9) && (
							<Menu.Item
								key="9"
								onClick={() => history.push("/payments/payment-slips")}
							>
								QL Chi tiêu
							</Menu.Item>
						)}
						{menuItemGranted.includes(10) && (
							<Menu.Item
								key="10"
								onClick={() => history.push("/payments/revenue")}
							>
								QL doanh thu
							</Menu.Item>
						)}
						{menuItemGranted.includes(11) && (
							<Menu.Item
								key="11"
								onClick={() => history.push("/payments/tuition")}
							>
								QL học phí
							</Menu.Item>
						)}
					</SubMenu>
				)}
			{menuItemGranted.includes(12) && (
				<Menu.Item
					key="12"
					icon={<SnippetsOutlined />}
					onClick={() => history.push("/news")}
				>
					Tin bài
				</Menu.Item>
			)}
			{menuItemGranted.includes(13) && (
				<Menu.Item
					key="13"
					icon={<GiftOutlined />}
					onClick={() => history.push("/gifts")}
				>
					Quà tặng
				</Menu.Item>
			)}
			{menuItemGranted.includes(14) && (
				<Menu.Item
					key="14"
					icon={<ApartmentOutlined />}
					onClick={() => history.push("/roles")}
				>
					Vai trò
				</Menu.Item>
			)}
			{menuItemGranted.includes(15) && (
				<Menu.Item
					key="15"
					icon={<FileOutlined />}
					onClick={() => history.push("/files")}
				>
					QL File
				</Menu.Item>
			)}
			{menuItemGranted.includes(16) && (
				<Menu.Item
					key="16"
					icon={<SettingOutlined />}
					onClick={() => history.push("/settings")}
				>
					Hệ thống
				</Menu.Item>
			)}

		</Menu>
	);
}

export default LeftMenu;
