import { Descriptions, Layout } from 'antd';
import { get } from 'lodash';
import moment from 'moment';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { RootState, useAppDispatch } from 'store/store';
import { actionGetStudentProfile } from 'store/students/slice';

export function StudyProfile(): JSX.Element {
    const params = useParams() as { student_id: string };
    const dispatch = useAppDispatch();

    const studentProfile = useSelector((state: RootState) => state.studentReducer.studentProfile);

    useEffect(() => {
        dispatch(actionGetStudentProfile(+params.student_id));
    }, [params, dispatch])


    return (
        <Layout.Content>
            <Descriptions title="Hồ sơ học sinh" bordered>
                <Descriptions.Item label="Họ và tên"><a>{get(studentProfile, "name", "")}</a></Descriptions.Item>
                <Descriptions.Item label="Ngày sinh">{moment(get(studentProfile, "birthday", "")).format("DD/MM/YYYY")}</Descriptions.Item>
                <Descriptions.Item label="Giới tính">{get(studentProfile, "gender", 0) === 0 ? "Nữ" : "Nam"}</Descriptions.Item>
                <Descriptions.Item label="Lớp học"><a>{get(studentProfile, "class.name", "")}</a></Descriptions.Item>
                <Descriptions.Item label="Ngày nhập học">{moment(get(studentProfile, "admission_date", "")).format("DD/MM/YYYY")}</Descriptions.Item>
                <Descriptions.Item label="Điểm đầu vào">{get(studentProfile, "knowledge_status", "")}</Descriptions.Item>
                <Descriptions.Item label="Trường đang học"  span={3}>{get(studentProfile, "school", "")}</Descriptions.Item>
                <Descriptions.Item label="Địa chỉ" span={3}>{get(studentProfile, "address", "")}</Descriptions.Item>
                <Descriptions.Item label="Sở thích"  span={3}>{get(studentProfile, "interests", "")}</Descriptions.Item>
                <Descriptions.Item label="Sở ghét"  span={3}>{get(studentProfile, "dislikes", "")}</Descriptions.Item>
                <Descriptions.Item label="Ước mơ"  span={3}>{get(studentProfile, "personality", "")}</Descriptions.Item>
                <Descriptions.Item label="Phụ huynh"  span={3}><a>{get(studentProfile, "parent.profile.name", "")}</a> - {get(studentProfile, "parent.phone", "")} </Descriptions.Item>
            </Descriptions>
        </Layout.Content>
    )
}