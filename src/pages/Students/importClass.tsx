import { Button, Select, Space, Spin, Tooltip } from "antd";
import Modal from "antd/lib/modal/Modal";
import { ClassType, GetResponseType, StudentType } from "interface";
import { get } from "lodash";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "store/store";
import { actionUpdateStudent, StudentParams } from "store/students/slice";


export default function ImportClass(props: {
	student: StudentType;
	classesList: GetResponseType<ClassType> | null;
	searchClass: (search: string) => void;
	searchStatus: string;
	show: boolean;
	setShow: (param: boolean) => void;
}): JSX.Element {
	const { student, classesList, searchClass, searchStatus, show, setShow } = props;
	const [classID, setClassID] = useState(null);
	const dispatch = useAppDispatch();

	const updateState = useSelector((state: RootState) => state.studentReducer.updateStudentStatus);

	useEffect(() => {
		if (updateState === 'success') {
			setShow(false);
		}
	}, [updateState])

	const handleSelected = (value: any) => {
		setClassID(value);
	};

	const handleSubmit = () => {
		if (classID) {
			const data: StudentParams = {
				...student,
				class_id: classID,
			};
			dispatch(
				actionUpdateStudent({
					data,
					sID: student.id,
				})
			);
		}
	};

	return (
		<>
			<Modal
				title="Nhập lớp học"
				visible={show}
				closable={true}
				onCancel={() => {
					setClassID(null);
					setShow(false)
				}}
				footer={[
					<Button key="btnSubmit" type="primary" onClick={handleSubmit} loading={updateState === 'loading'}>
						Lưu lại
					</Button>,
				]}
			>
				<Space direction="vertical" style={{ width: "100%" }}>
					<Select
						style={{ width: "100%" }}
						placeholder="Chọn lớp"
						filterOption={false}
						onChange={handleSelected}
						showSearch
						onSearch={(e) => searchClass(e)}
						notFoundContent={searchStatus === "loading" ? <Spin size="small" /> : null}
						defaultValue={get(student, "class.id", 0)}
					>
						<Select.Option value={0}>Chọn lớp học</Select.Option>
						{get(classesList, "data", []).map((cl: ClassType) => {
							return (
								<Select.Option key={cl.id} value={cl.id}>
									{cl.name}
								</Select.Option>
							);
						})}
					</Select>
				</Space>
			</Modal>
		</>
	);
}
