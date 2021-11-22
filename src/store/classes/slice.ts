import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notification } from "antd";
import { ClassType, ListClassesType } from "interface";
import request from "utils/request";

export interface ClassReducerState {
    classes: ListClassesType | null;
    classInfo: ClassType | null;
    getClassStatus: "idle" | "loading" | "success" | "error";
    getClassesStatus: "idle" | "loading" | "success" | "error";
    addClassStatus: "idle" | "loading" | "success" | "error";
    updateClassStatus: "idle" | "loading" | "success" | "error";
    addStudentsStatus: "idle" | "loading" | "success" | "error";
    addTestStatus: "idle" | "loading" | "success" | "error";
    getTestsStatus: "idle" | "loading" | "success" | "error";

}

export interface GetClassesPrams {
    search?: string;
    page?: number;
}

export interface ClassParams {
    name: string;
    sessions_num: 24;
    fee_per_session: 300000;
    employee_id: 1;
}

export interface AddTestParms {
    class_id:number;
    title:string;
    date:string;
    content_file:number;
}


const initialState: ClassReducerState = {
    classes: null,
    classInfo:null,
    getClassStatus: "idle",
    getClassesStatus: "idle",
    addClassStatus: "idle",
    updateClassStatus: "idle",
    addStudentsStatus: "idle",
    addTestStatus:"idle",
    getTestsStatus:"idle",
};

export const actionGetClass = createAsyncThunk("actionGetClass", async (class_id: number) => {
    const response = await request({
        url: `/api/classes/${class_id}`,
        method: "get",
    })
    return response.data;
})


export const actionGetClasses = createAsyncThunk("actionGetClasses", async (params: GetClassesPrams) => {
    const response = await request({
        url: "/api/classes",
        method: "get",
        params
    })
    return response.data;
})


export const actionAddClass = createAsyncThunk("actionAddClass", async (data: ClassParams) => {
    const response = await request({
        url: "/api/classes",
        method: "post",
        data
    })
    return response.data;
})


export const actionUpdateClass = createAsyncThunk("actionUdpateClass", async (params: { data: ClassParams, cID: number }) => {
    const { data, cID } = params;
    const response = await request({
        url: `/api/classes/${cID}`,
        method: "put",
        data
    })
    return response.data;
})


export const actionAddStudents = createAsyncThunk("actionAddStudents", async (params: { data: { students: number[] }, cID: number }) => {
    const { data, cID } = params;
    const response = await request({
        url: `/api/classes/add-students/${cID}`,
        method: "post",
        data
    })
    return response.data;
})


export const actionAddTest = createAsyncThunk("actionAddTest", async (data:AddTestParms) => {
    console.log(data)
    const response = await request({
        url: `/api/tests`,
        method: "post",
        data
    })
    return response.data;
})

export const classSlice = createSlice({
    name: "parent",
    initialState,
    reducers: {
        actionGetParents(state) {
            state.getClassesStatus = "idle";
        },
        actionAddClass(state) {
            state.addClassStatus = "idle";
        },
        actionUpdateClass(state) {
            state.updateClassStatus = "idle";
        },
        actionResetAddTestStatus(state) {
            state.addTestStatus = "idle";
        }

    },
    extraReducers: (builder) => {
        //get parents
        builder.addCase(actionGetClasses.pending, (state) => {
            state.getClassesStatus = "loading";
        })
            .addCase(actionGetClasses.fulfilled, (state, action) => {
                state.classes = action.payload as ListClassesType;
                state.getClassesStatus = "success";
            })
            .addCase(actionGetClasses.rejected, (state) => {
                state.getClassesStatus = "error";
                notification.error({ message: "Lấy danh sách lớp học bị lỗi" })
            })
            //get class infomation
            .addCase(actionGetClass.pending, (state) => {
                state.getClassStatus = "loading";
            })
            .addCase(actionGetClass.fulfilled, (state, action) => {
                state.classInfo = action.payload as ClassType;
                state.getClassStatus = "success";
            })
            .addCase(actionGetClass.rejected, (state) => {
                state.getClassStatus = "error";
                notification.error({ message: "Lấy danh sách lớp học bị lỗi" })
            })

            // add Class
            .addCase(actionAddClass.pending, (state) => {
                state.addClassStatus = "loading";
            })
            .addCase(actionAddClass.fulfilled, (state) => {
                state.addClassStatus = "success";
                notification.success({ message: "Thêm lớp học thành công!" })

            })
            .addCase(actionAddClass.rejected, (state) => {
                state.addClassStatus = "error";
                notification.error({ message: "Có lỗi xảy ra!" })
            })

            //update Class infomation
            .addCase(actionUpdateClass.pending, (state) => {
                state.updateClassStatus = "loading";
            })
            .addCase(actionUpdateClass.fulfilled, (state) => {
                state.updateClassStatus = "success";
                notification.success({ message: "Sửa thông tin lớp học thành công!" })

            })
            .addCase(actionUpdateClass.rejected, (state) => {
                state.updateClassStatus = "error";
                notification.error({ message: "Có lỗi xảy ra!" })
            })

            // add students
            .addCase(actionAddStudents.pending, (state) => {
                state.addStudentsStatus = "loading";
            })
            .addCase(actionAddStudents.fulfilled, (state) => {
                state.addStudentsStatus = "success";
                notification.success({ message: "Thêm học sinh thành công!" })

            })
            .addCase(actionAddStudents.rejected, (state) => {
                state.addStudentsStatus = "error";
                notification.error({ message: "Có lỗi xảy ra!" })
            })

             // add test
             .addCase(actionAddTest.pending, (state) => {
                state.addTestStatus = "loading";
            })
            .addCase(actionAddTest.fulfilled, (state) => {
                state.addTestStatus = "success";
                notification.success({ message: "Tạo bài test thành công!" })

            })
            .addCase(actionAddTest.rejected, (state) => {
                state.addTestStatus = "error";
                notification.error({ message: "Có lỗi xảy ra!" })
            })


    }
})

export const {actionResetAddTestStatus} = classSlice.actions;

export default classSlice.reducer;
