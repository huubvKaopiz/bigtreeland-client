import { AxiosResponse } from "axios";
import numeral from "numeral";
import { imageExtensionsList, ROLE_NAMES } from "./const";
import request from "./request";

export function formatCurrency(amount: number | string | undefined | null): string {
	return numeral(amount).format("(0,0 $)");
}

export function formatFileSize(size: number | string | undefined | null): string {
	return numeral(size).format("0.0 b");
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function dummyRequest(options: any): void {
	setTimeout(() => {
		if (options.onSuccess) options.onSuccess("ok");
	}, 0);
}

export function isImageType(type: string): boolean {
	return imageExtensionsList.includes(type.toLowerCase());
}

export function downloadFile(urlFile: string, fileName: string): void {
	request({
		url: urlFile,
		method: "GET",
		responseType: "blob",
	}).then((response: AxiosResponse<any>) => {
		const fileURL = window.URL.createObjectURL(new Blob([response.data]));
		const fileLink = document.createElement("a");
		fileLink.href = fileURL;
		fileLink.setAttribute("download", `${fileName}`);
		document.body.appendChild(fileLink);
		fileLink.click();
	});
}


export function converRoleNameToVN(role: ROLE_NAMES): string {
	let res = role as string;
	switch (role) {
		case ROLE_NAMES.ADMIM:
			res = 'Quản trị hệ thống';
			break;
		case ROLE_NAMES.TEACHER:
			res = "Giáo viên chính thức";
			break;
		case ROLE_NAMES.TEACHER2:
			res = "Giáo viên hợp đồng";
			break;
		case ROLE_NAMES.SALE:
			res = "Nhân viên kinh doanh";
			break;
		case ROLE_NAMES.EMPLOYEE:
			res = "Nhân viên";
			break;
		case ROLE_NAMES.PARENT:
			res = "Phụ huynh";
			break;
		default:
			break;
	}
	return res;
}

export function getPermissionDes(name: string): string {
	let res = '';
	switch (name) {
		case 'users':
			res = 'Người dùng';
			break;
		case 'get-list-teacher':
			res = 'Xem danh sách phụ huynh';
			break;
		case 'change-password-of-user':
			res = 'Thay đổi mật khẩu';
			break;
		case 'add-teacher':
			res = 'Thêm giáo viên';
			break;
		case 'tuition-fees':
			res = 'Học phí'
			break;
		case 'debit-tranfer':
			res = 'Chuyển nợ';
			break;
		case 'tests':
			res = 'Bài tập';
			break;
		case 'test-results':
			res = 'Kết quả bài tập';
			break;
		case 'study-summary-boards':
			res = 'Bảng tổng kết';
			break;
		case 'students':
			res = 'Học sinh';
			break;
		case 'update-status':
			res = 'Cập nhật trạng thái';
			break;

		case 'student-gifts':
			res = 'Chọn quà tặng';
			break;
		case 'settings':
			res = 'Cài đặt hệ thống';
			break;
		case 'salaries':
			res = 'Bảng lương';
			break;
		case 'roles':
			res = 'Vai trò';
			break;
		case 'set-role-for-list-user':
			res = 'Set vai trò cho người dùng';
			break;
		case 'remove-role-of-list-user':
			res = 'Bỏ vai trò của người dùng';
			break;
		case 'review-lessons':
			res = 'Xem lại bài học';
			break;
		case 'receipts':
			res = 'Phiếu thu';
			break;
		case 'permissions':
			res = 'Phân quyền';
			break;
		case 'set-permission-for-user':
			res = 'Phân quyền cho người dùng';
			break;
		case 'set-permission-for-role':
			res = 'Phân quyền cho vai trò';
			break;
		case 'list-permission-of-user':
			res = 'Xem ds quyền của người dùng';
			break;
		case 'period-tuitions':
			res = 'Chu kỳ học phí';
			break;
		case 'payment-slips':
			res = 'Phiếu chi';
			break;
		case 'notifications':
			res = 'Thông báo';
			break;
		case 'news':
			res = 'Tin tức';
			break;
		case 'lessons':
			res = 'Bài học';
			break;
		case 'lessons-feedback':
			res = 'Phản hồi bài học';
			break;
		case 'files':
			res = 'Quản lý files';
			break;
		case 'day-offs':
			res = 'Ngày nghỉ';
			break;
		case 'classes':
			res = 'Lớp học';
			break;
		case 'add-student':
			res = 'Thêm học sinh';
			break;
		case 'attendances':
			res = 'Điểm danh';
			break;
		case 'albums':
			res = 'Album ảnh ';
			break;
		case 'gifts':
			res = 'Quà tặng';
			break;
		default:
			break;
	}
	return res;
}