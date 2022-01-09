import {
	ReadOutlined,
	HomeOutlined,
	IdcardOutlined,
	DollarOutlined,
	TeamOutlined,
	SecurityScanOutlined,
	FileOutlined,
	SettingOutlined
} from "@ant-design/icons";
import { Menu } from "antd";
import { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";

const { SubMenu } = Menu;

function LeftMenu(): JSX.Element {
	const history = useHistory();
	const [selectedKeys, setSelectedKeys] = useState([""]);
	const [openKeys, setOpenKeys] = useState([""]);
	const location = useLocation();
	const pathname = location.pathname;

	useEffect(() => {
		if (pathname.includes("/tests")) {
			setOpenKeys(["classes"]);
			setSelectedKeys(["5"]);
			return;
		}

		if (pathname.includes("/settings")) {
			setSelectedKeys(["14"]);
			return;
		}

		if (pathname.includes("/files")) {
			setSelectedKeys(["13"]);
			return;
		}

		if (pathname.includes("/permissions")) {
			setOpenKeys(["permissions"]);
			setSelectedKeys(["11"]);
			return;
		}

		if (pathname.includes("/roles")) {
			setOpenKeys(["permissions"]);
			setSelectedKeys(["12"]);
			return;
		}

		if (pathname.includes("/payments/payment-slips")) {
			setOpenKeys(["payments"]);
			setSelectedKeys(["8"]);
			return;
		}

		if (pathname.includes("/payments/revenue")) {
			setOpenKeys(["payments"]);
			setSelectedKeys(["9"]);
			return;
		}

		if (pathname.includes("payments/tuition")) {
			setOpenKeys(["payments"]);
			setSelectedKeys(["10"]);
			return;
		}

		if (pathname.includes("/payments")) {
			setOpenKeys(["payments"]);
			return;
		}

		if (pathname.includes("/students")) {
			setOpenKeys(["classes"]);
			setSelectedKeys(["6"]);
			return;
		}

		if (pathname.includes("/parents")) {
			setOpenKeys(["classes"]);
			setSelectedKeys(["7"]);
			return;
		}

		if (pathname.includes("/classes")) {
			setOpenKeys(["classes"]);
			setSelectedKeys(["5"]);
			return;
		}

		if (pathname.includes("/salaries")) {
			setOpenKeys(["employees"]);
			setSelectedKeys(["4"]);
			return;
		}

		if (pathname.includes("/employees")) {
			setOpenKeys(["employees"]);
			setSelectedKeys(["3"]);
			return;
		}

		if (pathname.includes("/users")) {
			setOpenKeys([""]);
			setSelectedKeys(["2"]);
			return;
		}

		if (pathname.includes("/")) {
			setOpenKeys([""]);
			setSelectedKeys(["1"]);
			return;
		}

	
	}, [pathname]);

	return (
		<Menu theme="dark" mode="inline" selectedKeys={selectedKeys} openKeys={openKeys}>
			<Menu.Item key="1" icon={<HomeOutlined />} onClick={() => history.push("/")}>
				Trang chủ
			</Menu.Item>
			<Menu.Item key="2" icon={<TeamOutlined />} onClick={() => history.push("/users")}>
				Người dùng
			</Menu.Item>
			<SubMenu
				onTitleClick={() => setOpenKeys(["employees"])}
				key="employees"
				icon={<IdcardOutlined />}
				title="Nhân viên"
			>
				<Menu.Item key="3" onClick={() => history.push("/employees")}>
					Nhân viên
				</Menu.Item>
				<Menu.Item key="4" onClick={() => history.push("/salaries")}>
					Bảng lương
				</Menu.Item>
			</SubMenu>
			<SubMenu onTitleClick={() => setOpenKeys(["classes"])} key="classes" icon={<ReadOutlined />} title="QL học tập">
				<Menu.Item key="5" onClick={() => history.push("/classes")}>
					Lớp học
				</Menu.Item>
				<Menu.Item key="6" onClick={() => history.push("/students")}>
					Học sinh
				</Menu.Item>
				<Menu.Item key="7" onClick={() => history.push("/parents")}>
					Phụ huynh
				</Menu.Item>
			</SubMenu>
			<SubMenu onTitleClick={() => setOpenKeys(["payments"])} key="payments" icon={<DollarOutlined />} title="Thu Chi">
				<Menu.Item key="8" onClick={() => history.push("/payments/payment-slips")}>
					QL Chi tiêu
				</Menu.Item>
				<Menu.Item key="9" onClick={() => history.push("/payments/revenue")}>
					QL doanh thu
				</Menu.Item>
				<Menu.Item key="10" onClick={() => history.push("/payments/tuition")}>
					QL học phí
				</Menu.Item>
			</SubMenu>
			<SubMenu
				onTitleClick={() => setOpenKeys(["permissions"])}
				key="permissions"
				icon={<SecurityScanOutlined />}
				title="Phân quyền"
			>
				<Menu.Item key="11" onClick={() => history.push("/permissions")}>
					DS quyền
				</Menu.Item>
				<Menu.Item key="12" onClick={() => history.push("/roles")}>
					Vai trò
				</Menu.Item>
			</SubMenu>
			<Menu.Item key="13" icon={<FileOutlined />} onClick={() => history.push("/files")}>
				QL File
			</Menu.Item>
			<Menu.Item key="14" icon={<SettingOutlined />} onClick={() => history.push("/settings")}>
				Cài đặt
			</Menu.Item>
		</Menu>
	);
}

export default LeftMenu;
