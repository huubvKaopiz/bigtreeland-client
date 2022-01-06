import ClassDetail from "pages/Classes/classDetail";
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
import { ListTestResults } from "pages/Classes/listTestResult";
import Tuition from "pages/Tuition";
import AddTuition from "pages/Tuition/addTuition";
import TuitionDetail from "pages/Tuition/tuitionDetail";
import EditTuition from "pages/Tuition/editTuition";
import Settings from "pages/settings";
import Salaries from "pages/Salaries";
import AddSalary from "pages/Salaries/addSalary";
import EditSalary from "pages/Salaries/editSalary";

function Routes(): JSX.Element {
	return (
		<>
			<Route exact path="/" component={Home} />
			<Route path="/users" component={Users} />
			<Route path="/employees" component={Employees} />
			<Route path="/classes" component={Classes} />
			<Route path="/classes-detail/:class_id" component={ClassDetail} />
			<Route path="/tests/:test_id" component={ListTestResults} />
			<Route path="/students" component={Students} />
			<Route path="/payments/tuition" component={Tuition} />
			<Route path="/payments/tuition-detail/:tuition_id" component={TuitionDetail} />
			<Route path="/payments/tuition-create" component={AddTuition} />
			<Route path="/payments/tuition-edit/:tuition_id" component={EditTuition} />
			<Route path="/parents" component={Parents} />
			<Route path="/permissions" component={Permissions} />
			<Route path="/roles" component={Roles} />
			<Route path="/payments/payment-slips" component={Payment} />
			<Route path="/files" component={Files} />
			<Route path="/payments/revenue" component={Revenue} />
			<Route path="/settings" component={Settings} />
			<Route path="/salaries" component={Salaries} />
			<Route path="/salaries-create" component={AddSalary} />
			<Route path="/salaries-edit/:salary_id" component={EditSalary} />

		</>
	);
}

export default Routes;
