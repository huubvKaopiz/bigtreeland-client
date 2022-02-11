import {
	combineReducers,
	configureStore,
	getDefaultMiddleware,
} from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import attendanceReducer from "./attendances/slice";
import auth from "./auth/slice";
import classReducer from "./classes/slice";
import employeeReducer from "./employees/slice";
import filesReducer from "./files/slice";
import parentReducer from "./parents/slice";
import paymentReducer from "./payments/slice";
import permissionReducer from "./permissions/slice";
import roleReducer from "./roles/slice";
import studentReducer from "./students/slice";
import userReducer from "./users/slice";
import testReducer from "./testes/slice";
import revenuesReducer from "./revenues/slice";
import periodTuitionReducer from "./tuition/periodslice";
import tuitionFeeReducer from "./tuition/tuition";
import dayoffReducer from "./settings/dayoff";
import lessonReducer from "./lesson/slice";
import salariesReducer from "./salaries/slice";
import testResultsReducer from "./test-results/slice";
import studySummaryReducer from "./study-summary/slice";
import systemSettingReducer from './settings/system';
import newsReducer from './news/slice';
import notificationReducer from './notifications/slice';

const rootReducer = combineReducers({
	auth,
	userReducer,
	employeeReducer,
	roleReducer,
	permissionReducer,
	studentReducer,
	parentReducer,
	classReducer,
	paymentReducer,
	attendanceReducer,
	filesReducer,
	testReducer,
	revenuesReducer,
	periodTuitionReducer,
	dayoffReducer,
	tuitionFeeReducer,
	lessonReducer,
	salariesReducer,
	testResultsReducer,
	studySummaryReducer,
	systemSettingReducer,
	newsReducer,
	notificationReducer,
});

const persistConfig = {
	key: "root",
	storage,
	whitelist: ["auth"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const customizedMiddleware = getDefaultMiddleware({
	serializableCheck: false,
});

export const store = configureStore({
	reducer: persistedReducer,
	middleware: customizedMiddleware,
});

export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = () =>
	useDispatch<AppDispatch>();
