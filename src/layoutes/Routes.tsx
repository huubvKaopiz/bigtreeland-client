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
import { ListTestResults } from "pages/Classes/listTestResult";

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
			<Route path="/parents" component={Parents} />
			<Route path="/permissions" component={Permissions} />
			<Route path="/roles" component={Roles} />
			<Route path="/payment-slip" component={Payment} />
			<Route path="/files" component={Files} />
		</>
	);
}

export default Routes;
