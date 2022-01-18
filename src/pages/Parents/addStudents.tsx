import { Button, Select, Space, Tooltip } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { UsergroupAddOutlined } from "@ant-design/icons";
import Modal from "antd/lib/modal/Modal";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "store/store";
import { get } from "lodash";
import { actionGetStudents, actionUpdateStudent } from "store/students/slice";

export default function AddStudent(props: { parent_id: number }): JSX.Element {
	const { parent_id } = props;
	const dispatch = useDispatch()
	const [show, setShow] = useState(false);
	const [studentSelected, setStudentSelected] = useState<number[]>([])
	const storeListStudent = useSelector((state: RootState) => state.studentReducer.students)

	useEffect(() => {
		if (show) {
			dispatch(actionGetStudents({ per_page: 1000000 }));
		}
	}, [show, dispatch]);

	const handlSubmit = () => {
		studentSelected.map(sID => {
			dispatch(actionUpdateStudent({data: {parent_id}, sID}))
		})
		setShow(false)
	};

	function handleSelectStudent(value:any){
		setStudentSelected(value)
	}

	return (
		<>
			<Tooltip placement="top" title="Thêm học sinh">
				<Button
					icon={<UsergroupAddOutlined />}
					type="link"
					onClick={() => setShow(true)}
				/>
			</Tooltip>
			<Modal
				title="Thêm học sinh"
				visible={show}
				onCancel={() => setShow(false)}
				closable={true}
				width={800}
				footer={[
					<Button type="primary" key="btnsubmit" onClick={handlSubmit}>
						Lưu lại
					</Button>,
				]}
			>
				<Space direction="vertical" style={{ width: "100%" }}>
					<Select 
						mode="multiple"
						style= {{ width: "100%" }}
						placeholder="Chọn học sinh..."
						showSearch
						allowClear
						filterOption={(input, option) =>
							(option?.label as string)?.toLowerCase().indexOf(input.toLowerCase()) >= 0
						}
						onChange={handleSelectStudent}
					>
					
						{get(storeListStudent, "data", []).filter(student => !student.parent).map((student) => (
							<Select.Option
								value={student.id}
								key={student.id}
								label={`${get(student, "name", "")}`}
							>
								<a>{get(student, "name", "")}</a>
							</Select.Option>
						))}
					</Select>
				</Space>
			</Modal>
		</>
	);
}
