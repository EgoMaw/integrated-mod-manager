import { atom, createStore } from "jotai";
import { initGame, main } from "./init";
import { TEXT } from "./text";
import { VERSION } from "./consts";
main();
const init = { settings: true };
const store = createStore();
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
const CATEGORIES = atom([] as any);
const TYPES = atom([
	{
		_idRow: 29524,
		_sName: "Skins",
		_nItemCount: 1483,
		_nCategoryCount: 34,
		_sUrl: "https://gamebanana.com/mods/cats/29524",
		_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6654b6596ba11.png",
	},
	{
		_idRow: 29496,
		_sName: "UI",
		_nItemCount: 57,
		_nCategoryCount: 0,
		_sUrl: "https://gamebanana.com/mods/cats/29496",
		_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6692c913ddf00.png",
	},
	{
		_idRow: 29493,
		_sName: "Other",
		_nItemCount: 75,
		_nCategoryCount: 0,
		_sUrl: "https://gamebanana.com/mods/cats/29493",
		_sIconUrl: "https://images.gamebanana.com/img/ico/ModCategory/6692c90cba314.png",
	},
]);
//not-saved
const LEFT_SIDEBAR_OPEN = atom(true);
const RIGHT_SIDEBAR_OPEN = atom(true);
const ONLINE = atom(false);

const MOD_LIST = atom([] as any);
const SELECTED = atom("");
const FILTER = atom("All");
const CATEGORY = atom("All");
const SEARCH = atom("");

const ONLINE_DATA = atom<any>({});
const ONLINE_TYPE = atom("Mod");
const ONLINE_PATH = atom("home&type=Mod");
const ONLINE_SORT = atom("");
const ONLINE_SELECTED = atom("");

const CHANGES = atom({} as any);
const TEXT_DATA = atom(TEXT["en"]);
store.sub(SETTINGS, async () => {
	const settings = store.get(SETTINGS);
	const compare = {
		src: [settings.global.game, settings.global.lang],
		to: [GAME, LANG],
		names: ["game", "lang"],
	};
	for (let i = 0; i < compare.src.length; i++) {
		if (compare.src[i] !== store.get(compare.to[i])) {
			if (compare.names[i] === "lang" && compare.src[i])
				store.set(TEXT_DATA, TEXT[compare.src[i] as keyof typeof TEXT] || TEXT["en"]);
			else if (compare.names[i] === "game" && compare.src[i]) await initGame(compare.src[i]);
			store.set(compare.to[i], compare.src[i]);
		}
	}
});

export {
	store,
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
