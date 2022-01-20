import ppt from "../assets/image/pp.jpg";
import word from "../assets/image/w.png";
import excel from "../assets/image/ex.png";
import pdf from "../assets/image/pdf.png";
import ud from "../assets/image/ud.png";

export const imageExtensionsList = ["jpeg", "jpg", "gif", "png", "tiff", "jfif", "raw"];

export const fileIconList = {
	ppt: ppt,
	pptx: ppt,
	doc: word,
	docx: word,
	xls: excel,
	xlsx: excel,
	pdf: pdf,
	undefined: ud,
};

export const dayOptions = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];

export const dateFormat = "DD/MM/YYYY"


export enum ROLE_NAMES {
	ADMIM = 'admin',
	TEACHER = 'teacher',
	TEACHER2 = 'teacher2',
	SALE = 'sale',
	PARENT = 'parent',
	EMPLOYEE = 'employee'
}

