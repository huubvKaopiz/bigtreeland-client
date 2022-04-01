import Payment from "pages/Payment";
import Parents from "pages/Parents";
import Roles from "pages/Roles";
import Students from "pages/Students";
import { Route, useHistory } from "react-router-dom";
import Classes from "../pages/Classes";
import Employees from "../pages/Employees";
import Home from "../pages/Home";
import Permissions from "../pages/Permissions";
import Users from "../pages/Users";
import Files from "pages/Files";
import Revenue from "pages/Revenues";
import { TestDetail } from "pages/Study/Test/testDetail";
import Tuition from "pages/Tuition";
import TuitionDetail from "pages/Tuition/tuitionDetail";
import Salaries from "pages/Salaries";
import AddSalary from "pages/Salaries/addSalary";
import CreateTuitionPeriod from "pages/Tuition/createTuitionPeriod";
import { StudySumaryBoard } from "pages/Study/Summary";
import { StudySummaryDetail } from "pages/Study/Summary/studySummaryDetail";
import { SetRolePermissions } from "pages/Roles/setPermissions";
import { SetUserPermissions } from "pages/Users/SetPermissions";
import { StudyProfile } from "pages/Students/studyProfile";
import { News } from "pages/News";
import { Gifts } from "pages/Gifts";
import Study from "pages/Study";
import Settings from "pages/Settings";
import LessonDetails from "pages/Study/Lesson/lessonDetail";
import { get, isArray, isString } from "lodash";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "store/store";
import { MenuList } from "utils/leftMenu";
import { RoleType } from "interface";

interface RouteElementType {
	path: string;
	isExact: boolean;
	component: (props?: any) => JSX.Element;
	menuID: number;
}

function Routes(): JSX.Element {
	const history = useHistory();
	const userStore = useSelector((state: RootState) => state.auth.user);
	const [menuItemGranted, setMenuItemGranted] = useState<number[]>([]);

	const routes: RouteElementType[] = [
		{
			path: "/",
			isExact: true,
			component: Home,
			menuID: 1
		},
		{
			path: "/users",
			isExact: false,
			component: Users,
			menuID: 2
		},
		{
			path: "/employees",
			isExact: false,
			component: Employees,
			menuID: 3
		},
		{
			path: "/salaries",
			isExact: false,
			component: Salaries,
			menuID: 4
		},
		{
			path: "/salaries-create",
			isExact: false,
			component: AddSalary,
			menuID: -1
		},
		{
			path: "/classes",
			isExact: false,
			component: Classes,
			menuID: 5
		},
		{
			path: "/study/:class_id",
			isExact: true,
			component: Study,
			menuID: -1
		},
		{
			path: "/study/:class_id/lesson-detail/:lesson_id",
			isExact: true,
			component: LessonDetails,
			menuID: -1
		},
		{
			path: "/study-tests/:test_id/:class_id",
			isExact: true,
			component: TestDetail,
			menuID: -1
		},
		{
			path: "/study-summary",
			isExact: false,
			component: StudySumaryBoard,
			menuID: 8
		},
		{
			path: "/study-summary-detail/:sumamry_id",
			isExact: false,
			component: StudySummaryDetail,
			menuID: -1
		},
		{
			path: "/students",
			isExact: false,
			component: Students,
			menuID: 6
		},
		{
			path: "/students-study-profile/:student_id",
			isExact: false,
			component: StudyProfile,
			menuID: -1
		},
		{
			path: "/payments/tuition",
			isExact: false,
			component: Tuition,
			menuID: 11
		},
		{
			path: "/payments/tuition-detail/:tuition_id",
			isExact: true,
			component: TuitionDetail,
			menuID: -1
		},
		{
			path: "/payments/tuition-create",
			isExact: true,
			component: CreateTuitionPeriod,
			menuID: -1
		},
		{
			path: "/payments/revenue",
			isExact: false,
			component: Revenue,
			menuID: 10
		},
		{
			path: "/parents",
			isExact: false,
			component: Parents,
			menuID: 7
		},
		// {
		// 	path: "/permissions",
		// 	isExact: false,
		// 	component: Permissions,
		// 	menuID: true
		// },
		{
			path: "/roles",
			isExact: false,
			component: Roles,
			menuID: 14
		},
		{
			path: "/roles-set-permissions/:role_id",
			isExact: false,
			component: SetRolePermissions,
			menuID: -1
		},
		{
			path: "/user-set-permissions/:user_id",
			isExact: false,
			component: SetUserPermissions,
			menuID: -1
		},
		{
			path: "/payments/payment-slips",
			isExact: false,
			component: Payment,
			menuID: 9
		},
		{
			path: "/news",
			isExact: false,
			component: News,
			menuID: 12
		},
		{
			path: "/gifts",
			isExact: false,
			component: Gifts,
			menuID: 13
		},
		{
			path: "/settings",
			isExact: false,
			component: Settings,
			menuID: 16
		},
		{
			path: "/files",
			isExact: false,
			component: Files,
			menuID: 15
		}
	]

	useEffect(() => {
		const menuItem: number[] = [];
		get(userStore, "roles", []).map(({ id, menues }: RoleType) => {
			// admin === 1
			console.log(menues)
			if (id === 1) {
				menuItem.push(...MenuList.map((menu) => menu.value));
			} else {
				if (isString(menues) && menues.length > 2) {
					const menuList = `${menues}`
						.substring(1, `${menues}`?.length - 1)
						.split(",")
						.map((menu) => +menu);
					menuItem.push(...menuList);
				} else if (isArray(menues)) {
					if (menues) menuItem.push(...menues);
				}
			}
		});
		setMenuItemGranted([...new Set(menuItem)]);
		const first_path = routes.find((route) => route.menuID == menuItem[0])?.path
		if (first_path) history.push(first_path)
	}, [userStore]);


	return (
		<>
			{
				routes.map((route) =>
					menuItemGranted.findIndex((item) => item === route.menuID) !== -1 || route.menuID === -1
						?
						<Route exact path={route.path} component={route.component} />
						: null
				)
			}
			{/* <Route exact path="/" component={Home} />
			<Route path="/users" component={Users} />
			<Route path="/employees" component={Employees} />
			<Route path="/salaries" component={Salaries} />
			<Route path="/salaries-create" component={AddSalary} />
			<Route path="/classes" component={Classes} />
			<Route exact path="/study/:class_id" component={Study} />
			<Route
				exact
				path="/study/:class_id/lesson-detail/:lesson_id"
				component={LessonDetails}
			/>
			<Route
				path="/study-tests/:test_id/:class_id"
				component={TestDetail}
			/>
			<Route path="/study-summary" component={StudySumaryBoard} />
			<Route
				path="/study-summary-detail/:sumamry_id"
				component={StudySummaryDetail}
			/>
			<Route path="/students" component={Students} />
			<Route
				path="/students-study-profile/:student_id"
				component={StudyProfile}
			/>
			<Route path="/payments/tuition" component={Tuition} />
			<Route
				path="/payments/tuition-detail/:tuition_id"
				component={TuitionDetail}
			/>
			<Route path="/payments/tuition-create" component={CreateTuitionPeriod} />
			<Route path="/payments/revenue" component={Revenue} />
			<Route path="/parents" component={Parents} />
			<Route path="/permissions" component={Permissions} />
			<Route path="/roles" component={Roles} />
			<Route
				path="/roles-set-permissions/:role_id"
				component={SetRolePermissions}
			/>
			<Route
				path="/user-set-permissions/:user_id"
				component={SetUserPermissions}
			/>
			<Route path="/payments/payment-slips" component={Payment} />
			<Route path="/news" component={News} />
			<Route path="/gifts" component={Gifts} />
			<Route path="/files" component={Files} />
			<Route path="/settings" component={Settings} /> */}
		</>
	);
}

export default Routes;
