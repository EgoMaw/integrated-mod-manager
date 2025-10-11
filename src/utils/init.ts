import { path } from "@tauri-apps/api";
import { invoke } from "@tauri-apps/api/core";
import { currentMonitor, PhysicalSize } from "@tauri-apps/api/window";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { exists, writeTextFile, readTextFile } from "@tauri-apps/plugin-fs";
import defConfig from "../default.json";
import defConfigXX from "../defaultXX.json";
import { apiClient } from "./api";
import { CATEGORIES, DATA, GAME, LANG, PRESETS, SETTINGS, SOURCE, store, TARGET } from "./vars";
import { VERSION } from "./consts";
import { switchGameTheme } from "./theme";
// import { v2_0_4_migration } from "./filesys";

let isFirstLoad = false;
let config: any = { ...defConfig };
let configXX: any = { ...defConfigXX };
let dataDir = "";
export function getDataDir() {
	return dataDir;
}
export const window = getCurrentWebviewWindow();
invoke("get_username");
export function setWindowType(type: number) {
	if (type == 0) {
		window.setFullscreen(false);
		window.setDecorations(true);
		currentMonitor().then((x) => {
			if (x?.size) window.setSize(new PhysicalSize(x.size.width * 0.8, x.size.height * 0.8));
		});
	} else if (type == 1) {
		window.setFullscreen(false);
		window.setDecorations(false);
		currentMonitor().then((x) => {
			if (x?.size) window.setSize(new PhysicalSize(x.size.width * 0.8, x.size.height * 0.8));
		});
	} else if (type == 2) {
		window.setFullscreen(true);
	}
}
 invoke<string>('get_image_server_url').then((url) => {
	console.log("Image server URL:", url);
});
async function updateConfig(oconfig: any) {
	// await v2_0_4_migration(oconfig.dir);
	if (oconfig.version >= "2.1.0") return oconfig;
	let config = {
		version: VERSION,
		updatedAt: new Date().toISOString(),
		bgOpacity: oconfig.settings.opacity || 1,
		winOpacity: 1,
		winType: oconfig.settings.type || 0,
		bgType: oconfig.settings.bgType || 2,
		listType: 0,
		nsfw: oconfig.settings.nsfw || 1,
		toggleClick: oconfig.settings.toggle || 2,
		ignore: "2.0.4",
		clientDate: oconfig.settings.clientDate || "",
		exeXXMI: oconfig.settings.appDir || "",
		lang: oconfig.settings.lang || "",
		game: "",
	};
	let data = oconfig.data || {};
	let keys = Object.keys(data);
	for (let key of keys) {
		if(key.startsWith("\\")){
			data[key.substring(1)] = data[key];
			delete data[key];
		}
	}
	writeTextFile(
		`configWW.json`,
		JSON.stringify(
			{
				version: VERSION,
				sourceDir: "",
				targetDir: "",
				categories: [],
				settings: {
					launch: oconfig.settings.launch || 0,
					hotReload: oconfig.settings.hotReload || 1,
					onlineType: oconfig.settings.onlineType || "Mod",
				},
				data: oconfig.data || {},
				presets: oconfig.presets || [],
				updatedAt: new Date().getTime(),
			},
			null,
			2
		)
	);
	return config;
}
export async function initGame(game: string) {
	try {
		configXX = JSON.parse(await readTextFile(`config${game}.json`));
		switchGameTheme(game == "ZZ" ? "zzz" : "wuwa");
		dataDir = dataDir.replace("\\__MI", `\\${game}MI`);
	} finally {
		writeTextFile(`config${game}.json`, JSON.stringify(configXX, null, 2));
		store.set(DATA, configXX.data || {});
		store.set(SOURCE, configXX.sourceDir||(dataDir+"\\Mods") || "");
		store.set(TARGET, configXX.targetDir||dataDir || "");
		store.set(PRESETS, configXX.presets || []);
		store.set(SETTINGS, (prev) => ({ global: { ...prev.global, game }, game: { ...prev.game, ...configXX.settings } }));
	}
	return configXX;
}
let categories: any[] = [];
export async function main() {
	//Try to fetch categories(character list)
	try {
		categories = await apiClient.categories();
		if (!categories || categories.length == 0) throw "No categories found, please verify the directories again";
	} catch (e) {
		try {
			config = JSON.parse(await readTextFile("config.json"));
			if (config.game) configXX = await initGame(config.game);
		} finally {
			categories = configXX.categories || [];
		}
	} finally {
		if (!categories || categories.length == 0) return;
		store.set(CATEGORIES, categories);
	}
	const appData = await path.dataDir();
	dataDir = `${appData}\\XXMI Launcher\\__MI`;
	const exeXXMI = `${appData}\\XXMI Launcher\\Resources\\Bin\\XXMI Launcher.exe`;

	//Get config files
	try {
		config = JSON.parse(await readTextFile("config.json"));
	} finally {
		if (config.version < "2.1.0") {
			config = await updateConfig(config);
		}
		writeTextFile("config.json", JSON.stringify(config, null, 2));
		if (config.game) configXX = await initGame(config.game);
	}
	store.set(SETTINGS, (prev) => ({
		global: { ...prev.global, ...config },
		game: { ...prev.game, ...configXX.settings },
	}));
	
	setWindowType(config.winType);

	const bg = document.querySelector("body");
	if (bg)
		bg.style.backgroundColor = "color-mix(in oklab, var(--background) " + config.bgOpacity * 100 + "%, transparent)";
	if (configXX.targetDir == "" || configXX.sourceDir == "") {
		isFirstLoad = true;
		if (await exists(dataDir)) {
			configXX.target = dataDir;
			configXX.source = dataDir;
		} else dataDir = "";
	}

	if (config.exeXXMI == "" && (await exists(exeXXMI))) {
		config.exeXXMI = exeXXMI;
	}
		// if (config.settings.launch && config.settings.appDir) {
	// 	(async () => {
	// 		if (!(await isGameProcessRunning())) {
	// 			executeWWMI(config.settings.appDir);
	// 		}
	// 	})();
	// }

	// Check for updates with 2-second timeout
	// let update: Update | null = null;
	// try {
	// 	const timeoutPromise = new Promise<never>((_, reject) =>
	// 		setTimeout(() => reject(new Error("Update check timeout")), 2000)
	// 	);
	// 	update = await Promise.race([check(), timeoutPromise]);
	// } catch (error) {
	// 	// If check fails or times out, update remains null
	// 	update = null;
	// }
	// if (update) {
	// 	let lang = config.settings.lang;
	// 	let parsedBody = {};
	// 	if (update.body) {
	// 		try {
	// 			parsedBody = JSON.parse(update.body);
	// 			parsedBody = parsedBody[lang as keyof typeof parsedBody] || parsedBody;
	// 		} catch (e) {
	// 			parsedBody = {};
	// 		}
	// 	}
	// 	store.set(updateWWMMAtom, {
	// 		version: update.version,
	// 		date: update.date || "",
	// 		body: JSON.stringify(parsedBody) || "{}",
	// 		status: "available",
	// 		raw: update,
	// 	});
	// 	if (update.version > config.settings.ignore) {
	// 		store.set(updaterOpenAtom, true);
	// 		config.settings.ignore = update.version;
	// 	}
	// }

	// store.set(settingsDataAtom, config.settings as Settings);
	// if (config.settings.hotReload == 1) {
	// 	updateIni(0);
	// } else {
	// 	updateIni(1);
	// }

	// store.set(onlineTypeAtom, config.settings.onlineType ?? "Mod");
	// if (!firstLoad) {
	// 	if (config.settings.clientDate) fetch(`${HEALTH_CHECK}/${VERSION||"2.0.1"}/${config.settings.clientDate}`);
	// 	else {
	// 		fetch(`${HEALTH_CHECK}/${VERSION||"2.0.1"}/_${Date.now()}`)
	// 			.then((res) => res.json())
	// 			.then((data) => {
	// 				if (data.client) {
	// 					config.settings.clientDate = data.client;
	// 					store.set(settingsDataAtom, config.settings as Settings);
	// 					saveConfig();
	// 				}
	// 			});
	// 	}
	// }
	// updateInfo("Getting directory info...");
	// if (!firstLoad) {
	// 	getDirResructurePlan();
	// }
	// updateInfo("Initialization complete.", 2000);

	// setupImageServerListeners();

	// setHotreload(config.settings.hotReload as 0 | 1 | 2);

	// await registerGlobalHotkeys();
}
