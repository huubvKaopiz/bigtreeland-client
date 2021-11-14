import { combineReducers, configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import userReducer from "./users/slice";
import auth, { actionLogout } from "./auth/slice";
import employeeReducer from "./employees/slice";
import studentReducer from "./students/slice";
import parentReducer from "./parents/slice";
import classReducer from "./classes/slice";
import roleReducer from "./roles/slice";
import permissionReducer from "./permissions/slice";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { get } from "lodash";
import { api } from "utils/request";

const rootReducer = combineReducers({
	auth,
	userReducer,
	employeeReducer,
	roleReducer,
	permissionReducer,
	studentReducer,
	parentReducer,
	classReducer,
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

export const useAppDispatch: () => AppDispatch = () => useDispatch<AppDispatch>();

store.subscribe(() => {
	const access_token = get(store.getState(), "auth.user.access_token", "");
	if (access_token) {
		api.defaults.headers.common["Authorization"] = "Bearer ".concat(access_token);
	}

	api.interceptors.response.use(
		(response) => response,
		(error) => {
			if (get(error, "response.status", 1) === 401) {
				store.dispatch(actionLogout());
			}
			throw error;
		}
	);
});
