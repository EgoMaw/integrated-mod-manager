import { atom, createStore } from "jotai";
export const store = createStore();
// import { initGame } from "./init";
import { TEXT } from "./text";
import { DEFAULTS, VERSION } from "./consts";

// const init = { settings: true };
const INIT_DONE = atom(false);
const GAME = atom("");
const LANG = atom("en");
//saved
const LAST_UPDATED = atom(Date.now());
const SETTINGS = atom({
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
});
const SOURCE = atom("");
const TARGET = atom("");
const DATA = atom<any>({});
const PRESETS = atom<any[]>([]);
const CATEGORIES = atom([] as any[]);
const TYPES = atom([] as any[]);
//not-saved
const LEFT_SIDEBAR_OPEN = atom(true);
const RIGHT_SIDEBAR_OPEN = atom(true);
const RIGHT_SLIDEOVER_OPEN = atom(false);
const ONLINE = atom(false);
const DOWNLOAD_LIST = atom(DEFAULTS.DOWNLOAD_LIST);

const CURRENT_PRESET = atom(DEFAULTS.CURRENT_PRESET);
const MOD_LIST = atom(DEFAULTS.MOD_LIST);
const SELECTED = atom(DEFAULTS.SELECTED);
const FILTER = atom(DEFAULTS.FILTER);
const CATEGORY = atom(DEFAULTS.CATEGORY);
const SEARCH = atom(DEFAULTS.SEARCH);
const INSTALLED_ITEMS = atom(DEFAULTS.INSTALLED_ITEMS);
const ONLINE_DATA = atom<any>(DEFAULTS.ONLINE_DATA);
const ONLINE_TYPE = atom(DEFAULTS.ONLINE_TYPE);
const ONLINE_SORT = atom(DEFAULTS.ONLINE_SORT);
const ONLINE_PATH = atom(DEFAULTS.ONLINE_PATH);
const ONLINE_SELECTED = atom(DEFAULTS.ONLINE_SELECTED);

const CHANGES = atom({} as any);
const TEXT_DATA = atom(TEXT["en"]);
export function resetAtoms() {
	const atoms = {
		INIT_DONE,
		LANG,
		GAME,
		SETTINGS,
		SOURCE,
		TARGET,
		DATA,
		PRESETS,
		CATEGORIES,
		TYPES,
		CHANGES,
		ONLINE,
		DOWNLOAD_LIST,
		CURRENT_PRESET,
		MOD_LIST,
		SELECTED,
		FILTER,
		CATEGORY,
		SEARCH,
		INSTALLED_ITEMS,
		ONLINE_DATA,
		ONLINE_TYPE,
		ONLINE_PATH,
		ONLINE_SORT,
		ONLINE_SELECTED,
	};
	Object.keys(atoms).forEach((atom) => store.set(atoms[atom as keyof typeof atoms], DEFAULTS[atom as keyof typeof DEFAULTS]));
}
export {
	CURRENT_PRESET,
	INSTALLED_ITEMS,
	RIGHT_SLIDEOVER_OPEN,
	DOWNLOAD_LIST,
	TYPES,
	ONLINE_DATA,
	ONLINE_TYPE,
	ONLINE_PATH,
	ONLINE_SORT,
	ONLINE_SELECTED,
	CATEGORY,
	SEARCH,
	FILTER,
	GAME,
	INIT_DONE,
	LANG,
	SETTINGS,
	TEXT_DATA,
	SOURCE,
	TARGET,
	DATA,
	PRESETS,
	CATEGORIES,
	CHANGES,
	MOD_LIST,
	ONLINE,
	LEFT_SIDEBAR_OPEN,
	RIGHT_SIDEBAR_OPEN,
	LAST_UPDATED,
	SELECTED,
};
