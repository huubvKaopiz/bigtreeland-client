import ClassDetail from "pages/Classes/Study";
import Payment from "pages/Payment";
import Parents from "pages/Parents";
import Roles from "pages/Roles";
import Students from "pages/Students";
import { Route } from "react-router-dom";
import Classes from "../pages/Classes";
import Employees from "../pages/Employees";
import Home from "../pages/Home";
import Permissions from "../pages/Permissions";
import Users from "../pages/Users";
import Files from "pages/Files";
import Revenue from "pages/Revenues/Revenues";
import { ListTestResults } from "pages/Classes/Study/listTestResult";
import Tuition from "pages/Tuition";
import TuitionDetail from "pages/Tuition/tuitionDetail";
import Settings from "pages/Settings";
import Salaries from "pages/Salaries";
import AddSalary from "pages/Salaries/addSalary";
import CreateTuitionPeriod from "pages/Tuition/createTuitionPeriod";
import { StudySumaryBoard } from "pages/StudySummary";
import { StudySummaryDetail } from "pages/StudySummary/studySummaryDetail";
import { SetRolePermissions } from "pages/Roles/setPermissions";
import { SetUserPermissions } from "pages/Users/SetPermissions";
import { StudyProfile } from "pages/Students/studyProfile";
import AttendanceDetails from "pages/Classes/Study/attendanceDetails";
import { News } from "pages/News";
import { Gifts } from "pages/Gifts";
import Study from "pages/Classes/Study";

function Routes(): JSX.Element {
	return (
		<>
			<Route exact path="/" component={Home} />
			<Route path="/users" component={Users} />
			<Route path="/employees" component={Employees} />
			<Route path="/salaries" component={Salaries} />
			<Route path="/salaries-create" component={AddSalary} />
			<Route path="/classes" component={Classes} />
			<Route exact path="/study/:class_id" component={Study} />
			<Route path="/study/:class_id/attendace/:date" component={AttendanceDetails} />
			<Route path="/study/:class_id/edit-attendace/:date" component={AttendanceDetails} />
			<Route path="/study-tests/:test_id/:class_id" component={ListTestResults} />
			<Route path="/study-summary" component={StudySumaryBoard} />
			<Route path="/study-summary-detail/:sumamry_id" component={StudySummaryDetail} />
			<Route path="/students" component={Students} />
			<Route path="/students-study-profile/:student_id" component={StudyProfile} />
			<Route path="/payments/tuition" component={Tuition} />
			<Route path="/payments/tuition-detail/:tuition_id" component={TuitionDetail} />
			<Route path="/payments/tuition-create" component={CreateTuitionPeriod} />
			<Route path="/payments/revenue" component={Revenue} />
			<Route path="/parents" component={Parents} />
			<Route path="/permissions" component={Permissions} />
			<Route path="/roles" component={Roles} />
			<Route path="/roles-set-permissions/:role_id" component={SetRolePermissions} />
			<Route path="/user-set-permissions/:user_id" component={SetUserPermissions} />
			<Route path="/payments/payment-slips" component={Payment} />
			<Route path="/news" component={News} />
			<Route path="/gifts" component={Gifts} />
			<Route path="/files" component={Files} />
			<Route path="/settings" component={Settings} />
			
		</>
	);
}

export default Routes;
