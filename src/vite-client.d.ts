/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly REACT_APP_API: string;
	readonly REACT_APP_SOCKET: string;
	readonly REACT_APP_APIKEY: string;
	readonly REACT_APP_AUTHDOMAIN: string;
	readonly REACT_APP_PROJECTID: string;
	readonly REACT_APP_STORAGEBUCKET: string;
	readonly REACT_APP_MESSAGINGSENDERID: string;
	readonly REACT_APP_APPID: string;
	readonly REACT_APP_MEASUREMENTID: string;
}
interface ImportMeta {
	readonly env: ImportMetaEnv;
}
