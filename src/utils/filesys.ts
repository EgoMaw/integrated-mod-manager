import { copyFile, exists, mkdir, readDir, readTextFile, remove, rename, writeTextFile } from "@tauri-apps/plugin-fs";
import { IGNORE, managedSRC, managedTGT, OLD_RESTORE, RESTORE, UNCATEGORIZED, VERSION } from "./consts";
import { CATEGORIES, DATA, LAST_UPDATED, PRESETS, SETTINGS, SOURCE, store, TARGET } from "./vars";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { join } from "./utils";
const sp = [UNCATEGORIZED, IGNORE, OLD_RESTORE];
let src = "";
let tgt = "";
store.sub(SOURCE, () => {
	src = store.get(SOURCE);
});
store.sub(TARGET, () => {
	tgt = store.get(TARGET);
});
export function saveConfigs(settings = store.get(SETTINGS)) {
	const config: any = settings.global;
	config["updatedAt"] = new Date().toISOString();
	config["version"] = VERSION;
	writeTextFile("config.json", JSON.stringify(config, null, 2));
	if (config.game) {
		writeTextFile(
			`config${config.game}.json`,
			JSON.stringify(
				{
					version: VERSION,
					sourceDir: src,
					targetDir: tgt,
					settings: settings.game,
					data: store.get(DATA) || {},
					presets: store.get(PRESETS) || [],
					updatedAt: new Date().toISOString(),
					categories: store.get(CATEGORIES) || [],
				},
				null,
				2
			)
		);
	}
}
export async function selectPath(
	options = { multiple: false, directory: false } as { multiple?: boolean; directory?: boolean; defaultPath?: string }
) {
	return await open(options);
}
export function folderSelector(path = "") {
	return selectPath({ directory: true, ...(path ? { defaultPath: path } : {}) });
}
function replaceDisabled(name: string) {
	return name.replace("DISABLED_", "").replace("DISABLED", "").trim();
}
function sortMods(a: any, b: any) {
	let x = replaceDisabled(a.name);
	let y = replaceDisabled(b.name);
	return (
		x.localeCompare(y) *
		(x[0].toLowerCase() == y[0].toLowerCase() ? (x[0] == x[0].toUpperCase() && y[0] != y[0].toUpperCase() ? 1 : -1) : 1)
	);
}
async function copyDir(src: string, dest: string) {
	try {
		await mkdir(dest, { recursive: true });
		const entries = await readDir(src);
		for (const entry of entries) {
			const srcPath = `${src}/${entry.name}`;
			const destPath = `${dest}/${entry.name}`;
			if (!entry.isDirectory) {
				await copyFile(srcPath, destPath);
			} else {
				await copyDir(srcPath, destPath);
			}
		}
	} catch (error) {
		console.error("Error copying directory:", error);
		throw error;
	}
}
async function removeDir(path: string) {
	try {
		const entries = await readDir(path);
		for (const entry of entries) {
			if (entry.name == RESTORE) continue;
			const fullPath = join(path, entry.name);
			if (entry.isDirectory) {
				await removeDir(fullPath);
			} else {
				await remove(fullPath);
			}
		}
		await remove(path);
	} catch (error) {
		console.error("Error removing directory:", error);
	}
}
export async function checkOldVerDirs(src: string) {
	let checkFolders = 0;
	const entries = await readDir(src);
	for (const i of entries) {
		if (i.isDirectory) {
			if (sp.includes(i.name)) checkFolders++;
		}
	}
	return checkFolders == 3;
}
export async function categorizeDir(src: string) {
	let categories = [...store.get(CATEGORIES), { _sName: UNCATEGORIZED }].map((cat) => cat._sName);
	let reqCategories = {} as any;
	let entries = await readDir(src);
	let ignore = [IGNORE, OLD_RESTORE, managedSRC, managedTGT, RESTORE];
	for (const item of entries) {
		if (item.isDirectory && ignore.includes(item.name)) continue;
		const category =
			categories.find(
				(cat: any) =>
					cat.toLowerCase().includes(item.name.toLowerCase()) || item.name.toLowerCase().includes(cat.toLowerCase())
			) || UNCATEGORIZED;
		if (item.isDirectory && item.name == category) continue;
		else
			reqCategories[category] = [
				...(reqCategories[category] || []),
				{ name: item.name, isDirectory: item.isDirectory },
			];
	}
	for (let key of Object.keys(reqCategories)) {
		let list = reqCategories[key];
		await mkdir(join(src, key), { recursive: true });
		for (let item of list) {
			rename(join(src, item.name), join(src, key, replaceDisabled(item.name)));
		}
	}
}
export async function verifyDirStruct() {
	const status = {
		src: false,
		tgt: false,
		modDir: false,
		tgtDir: false,
		before: [] as any[],
		after: [] as any[],
		map: {} as any,
		title: "Confirm Changes",
		skip: false,
	};
	try {
		status.src = !!src && (await exists(src));
		status.tgt = !!tgt && (await exists(tgt));
		if (!status.src || !status.tgt) throw "Source or Target not found";
		let tgtDir = join(tgt, "Mods");
		status.tgtDir = await exists(tgtDir);
		if (!status.tgtDir) throw "Target Directory not found";
		let modDir = join(src, managedSRC);
		if (await exists(modDir)) {
			await categorizeDir(modDir);
			status.skip = true;
		}
		if (await checkOldVerDirs(src)) {
			await applyChanges(true);
			status.skip = true;
		}
		if (status.skip) throw "Migration done, please verify the directories again";
		const categories = [...store.get(CATEGORIES), { _sName: UNCATEGORIZED, _sIconUrl: "" }];
		let reqCategories = {} as any;
		status.before = (await readDir(src))
			.map((item) => ({
				name: item.name,
				isDirectory: item.isDirectory,
				children: [],
			}))
			.sort(sortMods)
			.filter((item) => item.name != IGNORE || !item.isDirectory);
		const before = [...status.before].filter(
			(item) => item.isDirectory && item.name != IGNORE && item.name != managedTGT && item.name != managedSRC
		);
		status.after = [
			{
				name: managedSRC,
				isDirectory: true,
				children: [],
			},
		];
		for (let item of before) {
			const category =
				categories.find(
					(cat: any) =>
						cat._sName.toLowerCase().includes(item.name.toLowerCase()) ||
						item.name.toLowerCase().includes(cat._sName.toLowerCase())
				) ||
				(item.name == RESTORE || item.name == OLD_RESTORE
					? { _sName: RESTORE, _sIconUrl: "" }
					: { _sName: UNCATEGORIZED, _sIconUrl: "" });
			if ((item.isDirectory && item.name == category._sName) || item.name == OLD_RESTORE) {
				reqCategories[category._sName] = {
					name: category._sName,
					icon: category._sIconUrl,
					isDirectory: true,
					children: [
						...((reqCategories[category._sName]?.children as any[]) || []),
						...(await readDir(join(src, item.name))).map((i) => ({ name: i.name, isDirectory: i.isDirectory })),
					],
				};
			} else
				reqCategories[category._sName] = {
					name: category._sName,
					icon: category._sIconUrl,
					isDirectory: true,
					children: [
						...((reqCategories[category._sName]?.children as any[]) || []),
						{ name: item.name, isDirectory: item.isDirectory },
					],
				};
		}
		status.map = { ...reqCategories };
		status.skip = Object.keys(reqCategories).length == 0;
		if (status.skip) throw "No categories found, please verify the directories again";
		if (await exists(modDir)) {
			const modDirEntries = await readDir(modDir);
			for (const item of modDirEntries) {
				if (!item.isDirectory) continue;
				const category =
					item.name == RESTORE
						? { _sName: RESTORE, _sIconUrl: "" }
						: categories.find((cat: any) => cat._sName.toLowerCase() == item.name.toLowerCase());
				if (category) {
					reqCategories[category._sName] = {
						name: category._sName,
						icon: category._sIconUrl || "",
						isDirectory: true,
						children: [
							...((reqCategories[category._sName]?.children as any[]) || []),
							...((await readDir(join(modDir, item.name))).map((i) => ({ name: i.name, isDirectory: i.isDirectory })) ||
								[]),
						],
					};
				}
			}
		}
		for (const key of Object.keys(reqCategories)) {
			status.after[0].children.push({
				...reqCategories[key],
				children: (reqCategories[key].children as any[]).sort(sortMods),
			});
		}
		status.after[0].children.sort(sortMods);
		status.after.sort(sortMods);
	} catch (e) {
		console.log(e);
	} finally {
		return status;
	}
}
export async function applyChanges(isMigration = false) {
	if (!src || !tgt) return false;
	let map = {} as any;
	if (!isMigration) map = (await verifyDirStruct()).map;
	let target = join(tgt, "Mods", managedTGT);
	if (!target) return true;
	await mkdir(join(src, managedSRC), { recursive: true });
	await categorizeDir(src);
	let entries = isMigration ? (await readDir(src)).map((item) => item.name) : Object.keys(map);
	for (let key of entries) {
		if (key == IGNORE || key == managedSRC || key == managedTGT) continue;
		if (key == RESTORE || key == OLD_RESTORE) {
			try {
				await rename(join(src, OLD_RESTORE), join(src, managedSRC, RESTORE));
			} catch (e) {
				try {
					await copyDir(join(src, RESTORE), join(src, managedSRC, RESTORE));
				} catch (e) {}
			} finally {
				continue;
			}
		} else await rename(join(src, key), join(src, managedSRC, key));

		await mkdir(join(target, key), { recursive: true });
		const dirEntries = isMigration ? await readDir(join(src, managedSRC, key)) : map[key].children;
		for (let item of dirEntries) {
			let isDisabled = item.name.startsWith("DISABLED");
			let name = replaceDisabled(item.name);
			if (isDisabled) {
				await rename(join(src, managedSRC, key, item.name), join(src, managedSRC, key, name));
			} else {
				await invoke("create_symlink", {
					linkPath: join(target, key, name),
					targetPath: join(src, managedSRC, key, name),
				});
			}
		}
	}
	return true;
}
async function readDirRecr(root: string, path: string, maxDepth = 2, depth = 0, def = true) {
	if (depth > maxDepth) return [];
	let entries = [] as any; // DirEntry[];
	try {
		entries = await readDir(join(root, path));
	} catch {
		return [];
	}
	let files = [] as any; // LocalMod[];
	for (let entry of entries) {
		if ((entry.name == RESTORE || entry.name == IGNORE) && def && depth == 0) continue;
		let children = [] as any; // LocalMod[];
		if (entry.isDirectory) children = await readDirRecr(root, join(path, entry.name), maxDepth, depth + 1);
		files.push({
			isDir: entry.isDirectory,
			name: entry.name,
			parent: join(path),
			path: join(path, entry.name),
			keys: [],
			enabled: false,
			children,
			depth,
		});
	}
	return files.sort(sortMods);
}
async function detectHotkeys(
	entries: any[],
	data: any /*LocalData*/,
	src: string
) /* Promise<[LocalMod[], ModHotkey[]]>*/ {
	let hotkeyData = [] as any[]; // ModHotkey[];
	for (let entry of entries) {
		try {
			if (data[entry.path]) {
				for (let key of Object.keys(data[entry.path])) {
					entry[key as "source" | "updatedAt" | "note"] = data[entry.path as keyof typeof data][
						key as "source" | "updatedAt" | "note"
					] as any;
				}
			}
			if (entry.name.endsWith(".ini")) {
				let file = await readTextFile(join(src, entry.path));
				let lines = file.split("\n");
				let counter = 0;
				let key = "";
				let type = "";
				let target = "";
				for (let line of lines) {
					line = line
						.trim()
						.replaceAll(/[\r\n]+/g, "")
						.replaceAll(" ", "");
					if (counter == 0 && line.startsWith("key=")) {
						key = line.split("=")[1].trim();
						counter++;
					} else if (counter == 1 && line.startsWith("type=")) {
						type = line.split("=")[1].trim();
						counter++;
					} else if (counter == 2 && line.startsWith("$")) {
						target = line.split("=")[0].trim().slice(1);
						counter = 0;
						hotkeyData.push({
							key,
							type,
							target,
							name: target,
						});
					}
				}
			}
			if (entry.isDir && entry.children.length > 0) {
				let childHK;
				[entry.children, childHK] = await detectHotkeys(entry.children, data, src);
				if (childHK.length > 0) {
					entry.keys = childHK;
				}
			}
		} catch {}
	}
	return [entries, hotkeyData];
}
export async function refreshModList() {
	const data = store.get(DATA);
	const modSrc = join(src, managedSRC);
	const modTgt = join(tgt, "Mods", managedTGT);
	await categorizeDir(modSrc);
	let entries = (await detectHotkeys(await readDirRecr(modSrc, "", 2), data, modSrc))[0]
		.map((entry) => entry.children)
		.flat()
		.sort(sortMods);
	for (let entry of entries) {
		if (entry.name.startsWith("DISABLED")) {
			await rename(join(modSrc, entry.path), join(modSrc, entry.parent, replaceDisabled(entry.name)));
			entry.name = replaceDisabled(entry.name);
			entry.path = join(entry.parent, entry.name);
		}
		entry.enabled = await exists(join(modTgt, entry.path));
	}
	console.log(entries);
	return entries;
}
export async function changeModName(path: any, newPath: string) {
	const enabled = await toggleMod(path, false);
	await mkdir(join(src, managedSRC, ...newPath.split("\\").slice(0, -1)), { recursive: true });
	await rename(join(src, managedSRC, path), join(src, managedSRC, newPath));
	if (enabled) await toggleMod(newPath, true);
	return newPath;
}
export async function toggleMod(path: any, enabled: boolean) {
	const modSrc = join(src, managedSRC, path);
	const modTgt = join(tgt, "Mods", managedTGT, path);
	if (enabled) {
		await mkdir(join(tgt, "Mods", managedTGT, path), { recursive: true });
		try {
			await invoke("create_symlink", {
				linkPath: modTgt,
				targetPath: modSrc,
			});
		} catch {
			return false;
		}
	} else {
		try {
			await remove(modTgt);
		} catch {
			return false;
		}
	}
	return true;
}
export async function savePreviewImage(path: string) {
	path = join(src, managedSRC, path);
	const file = await open({
		multiple: false,
		directory: false,
		filters: [{ name: "Image", extensions: ["png", "jpg", "jpeg", "webp", "gif"] }],
	});
	if (!file) return;
	let exts = ["png", "jpg", "jpeg", "webp", "gif"];
	for (let ext of exts) {
		try {
			await remove(path + "\\" + "preview." + ext);
		} catch {}
	}
	await copyFile(file, path + "\\" + "preview." + file.split(".").pop());
	store.set(LAST_UPDATED, Date.now());
}

export async function applyPreset(data: any) {
	await remove(join(tgt, "Mods", managedTGT), { recursive: true });
	await mkdir(join(tgt, "Mods", managedTGT), { recursive: true });
	for (let mod of data) {
		await toggleMod(mod, true);
	}
}
