import { Button, Checkbox, Modal } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { CheckboxValueType } from "antd/lib/checkbox/Group";
import { RoleType } from "interface";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { actionUpdateSettingMenuOfRole } from "store/roles/slice";
import { RootState } from "store/store";
import { MenuList } from "utils/leftMenu";

interface MenuViewProps {
	show: boolean;
	roleInfo: RoleType;
	setShow: (show: boolean) => void;
}

function SetMenuView(props: MenuViewProps): JSX.Element {
	const dispatch = useDispatch();
	const { setShow, show, roleInfo } = props;
	const [checkedList, setCheckedList] = useState<number[]>([]);
	const [checkAll, setCheckAll] = useState(false);
	const [indeterminate, setIndeterminate] = useState(false);
	const storeStateUpdateMenu = useSelector(
		(state: RootState) => state.roleReducer.statusUpdateRole
	);

	useEffect(() => {
		if (show) {
			setCheckedList(roleInfo?.menues ?? []);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [show]);

	useEffect(() => {
		if (storeStateUpdateMenu === "success") {
			setShow(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [storeStateUpdateMenu]);

    useEffect(() => {
        setCheckAll(checkedList.length === MenuList.length);
		setIndeterminate(!!checkedList.length && checkedList.length < MenuList.length);
    }, [checkedList])

	function handleSubmit() {
		console.log("submiting");
		const params = {
			role_id: roleInfo.id,
			menues: [...checkedList],
		};
		dispatch(actionUpdateSettingMenuOfRole(params));
	}

	function onCheckAllChange({ target: { checked } }: CheckboxChangeEvent) {
		setCheckedList(checked ? MenuList.map((menu) => menu.value) : []);
	}

	function checkboxChange(list: CheckboxValueType[]) {
		setCheckedList(list as number[]);
	}

	return (
		<Modal
			width={600}
			visible={show}
			onCancel={() => setShow(false)}
			closable
			title={`Cài đặt menu hiển thị cho ${roleInfo?.name ?? ""}`}
			okText="Lưu lại"
			cancelText="Huỳ bỏ"
			footer={[
				<Button key="btncancel" onClick={() => setShow(false)}>
					Huỷ bỏ
				</Button>,
				<Button
					loading={storeStateUpdateMenu === "loading"}
					key="btnsubmit"
					type="primary"
					onClick={handleSubmit}
				>
					Lưu lại
				</Button>,
			]}
		>
			<div style={{ marginBottom: 10 }}>
				<Checkbox
					checked={checkAll}
					indeterminate={indeterminate}
					onChange={onCheckAllChange}
				>
					Hiển thị tất cả
				</Checkbox>
			</div>
			<Checkbox.Group onChange={checkboxChange} value={checkedList}>
				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
					{MenuList.map((menu) => (
						<div key={menu.value} style={{ marginBottom: 10 }}>
							<Checkbox value={menu.value}>{menu.label}</Checkbox>
						</div>
					))}
				</div>
			</Checkbox.Group>
		</Modal>
	);
}

export default SetMenuView;
