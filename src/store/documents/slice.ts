import { async } from "@firebase/util";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notification } from "antd";
import { AxiosError } from "axios";
import { GetResponseType, DocumentType } from "interface";
import { get } from "lodash";
import request from "utils/request";
import { handleResponseError } from "utils/ultil";

export interface DocumentReducerState {
    documents: GetResponseType<DocumentType> | null;
    documentInfo: DocumentType | null;
    getDocumentStatus: "idle" | "loading" | "success" | "error";
    getDocumentsStatus: "idle" | "loading" | "success" | "error";
    updateDocumentStatus: "idle" | "loading" | "success" | "error";
    addDocumentStatus: "idle" | "loading" | "success" | "error";
    deleteDocumentStatus: "idle" | "loading" | "success" | "error";

}

export interface GetDocumentPrams {
    class_id?: number;
    from_date?: string;
    to_date?: string;
    page?: number;
}

export interface AddDocumentParms {
    class_id: number;
    title: string;
    link: string;
    files: number[];
}

export interface UpdateTestParams {
    id: number;
    title: string;
    link: string;
    files: number[];
}

const initialState: DocumentReducerState = {
    documents: null,
    documentInfo: null,
    getDocumentStatus: "idle",
    getDocumentsStatus: "idle",
    updateDocumentStatus: "idle",
    addDocumentStatus: "idle",
    deleteDocumentStatus:'idle',
};

export const actionGetDocuments = createAsyncThunk(
    "actionGetDocuments",
    async (params: GetDocumentPrams, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/api/documents`,
                method: "get",
                params
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const actionAddDocument = createAsyncThunk(
    "actionAddDocument",
    async (data: AddDocumentParms, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/api/documents`,
                method: "post",
                data,
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const actionUpdateDocument = createAsyncThunk(
    "actionUpdateDocument",
    async (updateData: UpdateTestParams, { rejectWithValue }) => {
        try {
            const { id, ...data } = updateData;
            const response = await request({
                url: `/api/documents/${id}`,
                method: "put",
                data,
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);
export const actionDeleteDocument = createAsyncThunk(
    "actionDeleteDocument",
    async (dID:number, { rejectWithValue }) => {
        try {
            
            const response = await request({
                url: `/api/documents/${dID}`,
                method: "delete",
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const documentSlice = createSlice({
    name: "parent",
    initialState,
    reducers: {
        actionGetDocuments(state) {
            state.getDocumentsStatus = "idle";
        },
        actionAddDocument(state) {
            state.addDocumentStatus = "idle";
        },
        actionUpdateDocument(state) {
            state.updateDocumentStatus = 'idle';
        },
        actionDeleteDocument(state) {
            state.deleteDocumentStatus = 'idle';
        }
    },
    extraReducers: (builder) => {
        //get documents
        builder
            .addCase(actionGetDocuments.pending, (state) => {
                state.getDocumentsStatus = "loading";
            })
            .addCase(actionGetDocuments.fulfilled, (state, action) => {
                state.documents = action.payload as GetResponseType<DocumentType>;
                state.getDocumentsStatus = "success";
            })
            .addCase(actionGetDocuments.rejected, (state, action) => {
                state.getDocumentsStatus = "error";
                const error = action.payload as AxiosError;
                handleResponseError(error, "xem danh sách tài liệu");
            })

            // add document
            .addCase(actionAddDocument.pending, (state) => {
                state.addDocumentStatus = "loading";
            })
            .addCase(actionAddDocument.fulfilled, (state) => {
                state.addDocumentStatus = "success";
                notification.success({ message: "Tạo tài liệu thành công!" });
            })
            .addCase(actionAddDocument.rejected, (state, action) => {
                state.addDocumentStatus = "error";
                const error = action.payload as AxiosError;
                handleResponseError(error, "thêm tài liệu");
            })
            //update
            .addCase(actionUpdateDocument.pending, (state) => {
                state.updateDocumentStatus = "loading";
            })
            .addCase(actionUpdateDocument.rejected, (state, action) => {
                state.updateDocumentStatus = "error";
                const error = action.payload as AxiosError;
                handleResponseError(error);
            })
            .addCase(actionUpdateDocument.fulfilled, (state) => {
                state.updateDocumentStatus = "success";
                notification.success({ message: "Cập nhật tài liệu thành công!" });
            })
            //delete
            .addCase(actionDeleteDocument.pending, (state) => {
                state.deleteDocumentStatus = "loading";
            })
            .addCase(actionDeleteDocument.rejected, (state, action) => {
                state.deleteDocumentStatus = "error";
                const error = action.payload as AxiosError;
                handleResponseError(error);
            })
            .addCase(actionDeleteDocument.fulfilled, (state) => {
                state.deleteDocumentStatus = "success";
                notification.success({ message: "Đã xoá tài liệu!" });
            });
    },
});

export default documentSlice.reducer