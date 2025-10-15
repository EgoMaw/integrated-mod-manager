import { TEXT } from "./text";
export const IMAGER_SERVER = "http://127.0.0.1:5000/preview";
export const OLD_RESTORE = "DISABLED_RESTORE";
export const RESTORE = "RESTORE";
export const IGNORE = "IGNORE";
export const UNCATEGORIZED = "Uncategorized";
export const managedSRC = "DISABLED (Managed by IMM)";
export const managedTGT = "Mods (Managed by IMM)";
export const VERSION = "2.1.0";
export const GAMES = ["WW", "ZZ"];
export const PRIORITY_KEYS = ["Alt", "Ctrl", "Shift", "Capslock", "Tab", "Up", "Down", "Left", "Right"] as const;
export const LANG_LIST = [
	{
		Name: TEXT.en.generic.Current,
		Flag: TEXT.en.generic.Flag,
		Code: "en",
	},
	{
		Name: TEXT.cn.generic.Current,
		Flag: TEXT.cn.generic.Flag,
		Code: "cn",
	},
	{
		Name: TEXT.ru.generic.Current,
		Flag: TEXT.ru.generic.Flag,
		Code: "ru",
	},
	{
		Name: TEXT.jp.generic.Current,
		Flag: TEXT.jp.generic.Flag,
		Code: "jp",
	},
	{
		Name: TEXT.kr.generic.Current,
		Flag: TEXT.kr.generic.Flag,
		Code: "kr",
	},
];
export const ONLINE_TRANSITION = (online: boolean, move = false) => ({
	initial: { opacity: 0, x: move ? (online ? "25%" : "-25%") : 0 },
	animate: { opacity: 1, x: 0 },
	exit: { opacity: 0, x: move ? (online ? "25%" : "-25%") : 0 },
	transition: { duration: 0.2 },
});
export const GAME_ID_MAP: { [key: string]: number } = {
	WW: 0,
	ZZ: 1,
	GI: 2,
	SR: 3,
};
export const DEFAULTS = {
	INIT_DONE : false,
	LANG: "en",
	GAME: "",
	SETTINGS:{
	global: {
		bgOpacity: 1,
		winOpacity: 1,
		winType: 0,
		bgType: 2,
		listType: 0,
		nsfw: 1,
		toggleClick: 2,
		ignore: VERSION,
		clientDate: "1759866302559426603",
		exeXXMI: "",
		lang: "",
		game: "",
	},
	game: {
		launch: 0,
		hotReload: 1,
		onlineType: "Mod",
	},
},
	SOURCE:"",
	TARGET:"",
	DATA:{},
	PRESETS:[],
	CATEGORIES:[],
	TYPES:[],
	CHANGES:{},
	DOWNLOAD_LIST: {
		queue: [] as any[],
		downloading: {} as any,
		completed: [] as any[],
	},
	CURRENT_PRESET: -1,
	MOD_LIST: [] as any[],
	SELECTED: "",
	FILTER: "All",
	CATEGORY: "All",
	SEARCH: "",
	INSTALLED_ITEMS: [] as any[],
	ONLINE_DATA: {} as any,
	ONLINE_TYPE: "Mod",
	ONLINE_SORT: "",
	ONLINE_PATH: "home&type=Mod",
	ONLINE_SELECTED: "",
	ONLINE: false,
};
