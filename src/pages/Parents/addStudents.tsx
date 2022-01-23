import { Button, Select, Space } from "antd";
import React, { useEffect, useState } from "react";
import Modal from "antd/lib/modal/Modal";
import { useDispatch } from "react-redux";
import { get } from "lodash";
import { ParentType, StudentType } from "interface";
import { actionUpdateStudent } from "store/students/slice";

export default function AddStudent(props: {
	parentInfo: ParentType,
	students: StudentType[],
	searchStudent: (search: string) => void,
	show:boolean,
	setShow:(param:boolean) => void,
}): JSX.Element {
	const { parentInfo, searchStudent, students, show, setShow } = props;
	const dispatch = useDispatch()
	const [studentSelected, setStudentSelected] = useState<number[]>([])

	useEffect(() => {
		if (show) {
			searchStudent('');
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [show]);

	const handlSubmit = () => {
		if(parentInfo){
			studentSelected.map(sID => {
				dispatch(actionUpdateStudent({ data: {parent_id:parentInfo.id }, sID }))
			})
			setShow(false)
		}
		
	};

	function handleSelectStudent(value: any) {
		setStudentSelected(value)
	}

	return (
		<>
			
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
						style={{ width: "100%" }}
						placeholder="Chọn học sinh..."
						showSearch
						onSearch={(e) => searchStudent(e)}
						allowClear
						filterOption={false}
						onChange={handleSelectStudent}
					>

						{students && students.filter(student => !student.parent).map((student) => (
							<Select.Option
								value={student.id}
								key={student.id}
								label={`${get(student, "name", "")}`}
							>
								<a>{get(student, "name", "")}</a> {get(student,"birthday","")}
							</Select.Option>
						))}
					</Select>
				</Space>
			</Modal>
		</>
	);
}
