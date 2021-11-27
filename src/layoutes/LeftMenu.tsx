import {
	ReadOutlined,
	HomeOutlined,
	IdcardOutlined,
	DollarOutlined,
	TeamOutlined,
	SecurityScanOutlined,
	FileOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import { useState } from "react";
import { useHistory } from "react-router-dom";

const { SubMenu } = Menu;

function LeftMenu(): JSX.Element {
	const history = useHistory();
	const [selectedKeys, setSelectedKeys] = useState(["5"]);
	const [openKeys, setOpenKeys] = useState(["sub2"]);

	return (
		<Menu theme="dark" mode="inline" selectedKeys={selectedKeys} openKeys={openKeys}>
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
					Lớp học
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
			<Menu.Item key="sub5" icon={<FileOutlined />} onClick={() => history.push("/files")}>
				QL File
			</Menu.Item>
		</Menu>
	);
}

export default LeftMenu;
