import { copyFile, exists, mkdir, readDir, readTextFile, remove, rename, writeTextFile } from "@tauri-apps/plugin-fs";
import { IGNORE, managedSRC, managedTGT, OLD_RESTORE, RESTORE, UNCATEGORIZED, VERSION } from "./consts";
import { CATEGORIES, DATA, INIT_DONE, LAST_UPDATED, PRESETS, SETTINGS, SOURCE, store, TARGET } from "./vars";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { join } from "./utils";
import { main } from "./init";

// Initialize Intl.Collator for faster string comparison
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

const sp = [UNCATEGORIZED, IGNORE, OLD_RESTORE];
let src = "";
let tgt = "";
store.sub(SOURCE, () => {
	src = store.get(SOURCE);
});
store.sub(TARGET, () => {
	tgt = store.get(TARGET);
});
export function safeLoadJson(cur: any, neww: any) {
	if (!cur || !neww) return;
	Object.keys(neww).forEach((key) => {
		if (typeof neww[key] === "object" && !Array.isArray(neww[key])) {
			cur[key] = safeLoadJson(cur[key], neww[key]) || cur[key] || {};
		} else {
			cur[key] = neww[key];
		}
	});
	return cur;
}
export async function setConfig(config: any) {
	if (!config) return;
	let { gameConfig: curConfig } = getConfig(store.get(SETTINGS));
	if (!curConfig.game || !config.game || curConfig.game !== config.game) return;
	curConfig = safeLoadJson(curConfig, config) || curConfig;
	curConfig.version = VERSION;
	await writeTextFile(`config${curConfig.game}.json`, JSON.stringify(curConfig, null, 2));
	// store.set(INIT_DONE,false)
	main();

}
export function getConfig(settings: any) {
	const config: any = settings.global;
	config["updatedAt"] = new Date().toISOString();
	config["version"] = VERSION;
	const gameConfig: any = {
		version: VERSION,
		game: settings.global.game,
		sourceDir: store.get(SOURCE),
		targetDir: store.get(TARGET),
		settings: settings.game,
		data: store.get(DATA) || {},
		presets: store.get(PRESETS) || [],
		updatedAt: new Date().toISOString(),
		categories: store.get(CATEGORIES) || [],
	};
	return { config, gameConfig };
}
export async function saveConfigs(skip = false, settings = store.get(SETTINGS)) {
	try {
		const { config, gameConfig } = getConfig(settings);
		const promises: Promise<void>[] = [];
		promises.push(writeTextFile("config.json", JSON.stringify(config, null, 2)));
		if (config.game && !skip) {
			promises.push(writeTextFile(`config${config.game}.json`, JSON.stringify(gameConfig, null, 2)));
		}
		await Promise.all(promises);
	} catch (error) {
		console.error("Error saving configs:", error);
		throw error;
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

/**
 * Optimized sorting function using Intl.Collator for better performance
 * Handles case-insensitive sorting with uppercase precedence for same letters
 */
function sortMods(a: any, b: any) {
	const x = replaceDisabled(a.name);
	const y = replaceDisabled(b.name);

	// Use Intl.Collator for faster comparison
	const comparison = collator.compare(x, y);

	if (comparison !== 0) {
		return comparison;
	}

	// If names are equal after collation, prioritize uppercase
	const xFirstLower = x[0]?.toLowerCase();
	const yFirstLower = y[0]?.toLowerCase();

	if (xFirstLower === yFirstLower) {
		const xIsUpper = x[0] === x[0]?.toUpperCase();
		const yIsUpper = y[0] === y[0]?.toUpperCase();

		if (xIsUpper && !yIsUpper) return 1;
		if (!xIsUpper && yIsUpper) return -1;
	}

	return 0;
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
		throw error;
	}
}
export async function checkOldVerDirs(src: string) {
	try {
		let checkFolders = 0;
		const entries = await readDir(src);
		for (const i of entries) {
			if (i.isDirectory && sp.includes(i.name)) {
				checkFolders++;
			}
		}
		return checkFolders === 3;
	} catch (error) {
		console.error("Error checking old version directories:", error);
		return false;
	}
}
export async function categorizeDir(src: string) {
	try {
		const categories = [...store.get(CATEGORIES), { _sName: UNCATEGORIZED }].map((cat) => cat._sName);
		const reqCategories: Record<string, Array<{ name: string; isDirectory: boolean }>> = {};
		const entries = await readDir(src);
		const ignore = [IGNORE, managedSRC, managedTGT, RESTORE];

		// First pass: categorize items
		for (const item of entries) {
			if (item.isDirectory && ignore.includes(item.name)) continue;

			if (item.name === OLD_RESTORE) {
				try {
					await rename(join(src, OLD_RESTORE), join(src, RESTORE));
				} catch (error) {
					console.error("Error renaming OLD_RESTORE:", error);
				}
				continue;
			}

			const category =
				categories.find((cat: string) =>
					cat
						.toLowerCase()
						.split(" ")
						.some(
							(catPart: string) =>
								catPart.includes(item.name.toLowerCase()) || item.name.toLowerCase().includes(catPart)
						)
				) || UNCATEGORIZED;

			if (item.isDirectory && item.name === category) continue;

			if (!reqCategories[category]) {
				reqCategories[category] = [];
			}
			reqCategories[category].push({ name: item.name, isDirectory: item.isDirectory });
		}

		// Second pass: batch create directories and move items
		const mkdirPromises: Promise<void>[] = [];
		for (const key of Object.keys(reqCategories)) {
			mkdirPromises.push(mkdir(join(src, key), { recursive: true }));
		}
		await Promise.all(mkdirPromises);

		// Move items to categories
		const renamePromises: Promise<void>[] = [];
		for (const [key, list] of Object.entries(reqCategories)) {
			for (const item of list) {
				renamePromises.push(
					rename(join(src, item.name), join(src, key, replaceDisabled(item.name))).catch((error) => {
						console.error(`Error renaming ${item.name}:`, error);
					})
				);
			}
		}
		await Promise.all(renamePromises);
	} catch (error) {
		console.error("Error categorizing directory:", error);
		throw error;
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
		if (!status.src || !status.tgt) throw new Error("Source or Target not found");
		const tgtDir = join(tgt, "Mods");
		status.tgtDir = await exists(tgtDir);
		if (!status.tgtDir) throw new Error("Target Directory not found");

		const modDir = join(src, managedSRC);
		const [modDirExists, isOldVersion] = await Promise.all([exists(modDir), checkOldVerDirs(src)]);

		if (modDirExists) {
			await categorizeDir(modDir);
			status.skip = true;
		}
		if (isOldVersion) {
			await applyChanges(true);
			status.skip = true;
		}
		if (status.skip) throw new Error("Migration done, please verify the directories again");
		const categories = [...store.get(CATEGORIES), { _sName: UNCATEGORIZED, _sIconUrl: "" }];
		const reqCategories: Record<string, any> = {};

		const srcEntries = await readDir(src);
		status.before = srcEntries
			.map((item) => ({
				name: item.name,
				isDirectory: item.isDirectory,
				children: [],
			}))
			.sort(sortMods)
			.filter((item) => item.name !== IGNORE || !item.isDirectory);

		const before = [...status.before].filter(
			(item) => item.isDirectory && item.name !== IGNORE && item.name !== managedTGT && item.name !== managedSRC
		);
		status.after = [
			{
				name: managedSRC,
				isDirectory: true,
				children: [],
			},
		];

		// Batch read directories for items that need it
		const readPromises: Promise<{ item: any; entries: any[] }>[] = [];
		for (const item of before) {
			const category =
				categories.find((cat: any) =>
					cat._sName
						.toLowerCase()
						.split(" ")
						.some(
							(catPart: string) =>
								catPart.includes(item.name.toLowerCase()) || item.name.toLowerCase().includes(catPart)
						)
				) ||
				(item.name === RESTORE || item.name === OLD_RESTORE
					? { _sName: RESTORE, _sIconUrl: "" }
					: { _sName: UNCATEGORIZED, _sIconUrl: "" });

			if ((item.isDirectory && item.name === category._sName) || item.name === OLD_RESTORE) {
				readPromises.push(
					readDir(join(src, item.name))
						.then((entries) => ({ item, entries, category }))
						.catch((error) => {
							console.error(`Error reading directory ${item.name}:`, error);
							return { item, entries: [], category };
						})
				);
			} else {
				// Add item directly without reading
				if (!reqCategories[category._sName]) {
					reqCategories[category._sName] = {
						name: category._sName,
						icon: category._sIconUrl,
						isDirectory: true,
						children: [],
					};
				}
				reqCategories[category._sName].children.push({ name: item.name, isDirectory: item.isDirectory });
			}
		}

		// Process all read operations in parallel
		const readResults = await Promise.all(readPromises);
		for (const { item, entries, category } of readResults as any) {
			if (!reqCategories[category._sName]) {
				reqCategories[category._sName] = {
					name: category._sName,
					icon: category._sIconUrl,
					isDirectory: true,
					children: [],
				};
			}
			reqCategories[category._sName].children.push(
				...entries.map((i: any) => ({ name: i.name, isDirectory: i.isDirectory }))
			);
		}
		status.map = { ...reqCategories };
		status.skip = Object.keys(reqCategories).length === 0;
		if (status.skip) throw new Error("No categories found, please verify the directories again");

		// Process modDir if it exists
		if (modDirExists) {
			try {
				const modDirEntries = await readDir(modDir);
				const modDirReadPromises: Promise<{ category: any; entries: any[] }>[] = [];

				for (const item of modDirEntries) {
					if (!item.isDirectory) continue;

					const category =
						item.name === RESTORE
							? { _sName: RESTORE, _sIconUrl: "" }
							: categories.find((cat: any) =>
									cat._sName
										.toLowerCase()
										.split(" ")
										.some(
											(catPart: string) =>
												catPart.includes(item.name.toLowerCase()) || item.name.toLowerCase().includes(catPart)
										)
							  );

					if (category) {
						modDirReadPromises.push(
							readDir(join(modDir, item.name))
								.then((entries) => ({ category, entries }))
								.catch((error) => {
									console.error(`Error reading modDir category ${item.name}:`, error);
									return { category, entries: [] };
								})
						);
					}
				}

				const modDirResults = await Promise.all(modDirReadPromises);
				for (const { category, entries } of modDirResults) {
					if (!reqCategories[category._sName]) {
						reqCategories[category._sName] = {
							name: category._sName,
							icon: category._sIconUrl || "",
							isDirectory: true,
							children: [],
						};
					}
					reqCategories[category._sName].children.push(
						...entries.map((i: any) => ({ name: i.name, isDirectory: i.isDirectory }))
					);
				}
			} catch (error) {
				console.error("Error processing modDir:", error);
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
		//console.log(e);
	} finally {
		return status;
	}
}
export async function applyChanges(isMigration = false) {
	try {
		if (!src || !tgt) return false;

		let map: Record<string, any> = {};
		if (!isMigration) {
			map = (await verifyDirStruct()).map;
		}

		const target = join(tgt, "Mods", managedTGT);
		if (!target) return true;

		await mkdir(join(src, managedSRC), { recursive: true });
		await categorizeDir(src);

		const entries = isMigration ? (await readDir(src)).map((item) => item.name) : Object.keys(map);

		// Batch process entries
		for (const key of entries) {
			if (key === IGNORE || key === managedSRC || key === managedTGT) continue;

			if (key === RESTORE || key === OLD_RESTORE) {
				try {
					await rename(join(src, OLD_RESTORE), join(src, managedSRC, RESTORE));
				} catch (e) {
					try {
						await copyDir(join(src, RESTORE), join(src, managedSRC, RESTORE));
					} catch (e) {
						console.error(`Error handling RESTORE directory:`, e);
					}
				}
				continue;
			}

			try {
				await rename(join(src, key), join(src, managedSRC, key));
			} catch (error) {
				console.error(`Error renaming ${key}:`, error);
				continue;
			}

			await mkdir(join(target, key), { recursive: true });

			const dirEntries = isMigration ? await readDir(join(src, managedSRC, key)) : map[key].children;

			// Batch process directory entries
			const itemOperations: Promise<void>[] = [];
			for (const item of dirEntries) {
				const isDisabled = item.name.startsWith("DISABLED");
				const name = replaceDisabled(item.name);

				if (isDisabled) {
					itemOperations.push(
						rename(join(src, managedSRC, key, item.name), join(src, managedSRC, key, name)).catch((error) => {
							console.error(`Error renaming disabled item ${item.name}:`, error);
						})
					);
				} else {
					itemOperations.push(
						invoke<void>("create_symlink", {
							linkPath: join(target, key, name),
							targetPath: join(src, managedSRC, key, name),
						}).catch((error) => {
							console.error(`Error creating symlink for ${name}:`, error);
						}) as Promise<void>
					);
				}
			}
			await Promise.all(itemOperations);
		}
		return true;
	} catch (error) {
		console.error("Error applying changes:", error);
		throw error;
	}
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
	const hotkeyData: any[] = []; // ModHotkey[];

	for (const entry of entries) {
		try {
			// Apply stored data to entry
			if (data[entry.path]) {
				for (const key of Object.keys(data[entry.path])) {
					entry[key as "source" | "updatedAt" | "note"] = data[entry.path as keyof typeof data][
						key as "source" | "updatedAt" | "note"
					] as any;
				}
			}

			// Parse .ini files for hotkeys
			if (entry.name.endsWith(".ini")) {
				try {
					const file = await readTextFile(join(src, entry.path));
					const lines = file.split("\n");
					let counter = 0;
					let key = "";
					let type = "";
					let target = "";

					for (let line of lines) {
						line = line
							.trim()
							.replaceAll(/[\r\n]+/g, "")
							.replaceAll(" ", "");

						if (counter === 0 && line.startsWith("key=")) {
							key = line.split("=")[1]?.trim() || "";
							counter++;
						} else if (counter === 1 && line.startsWith("type=")) {
							type = line.split("=")[1]?.trim() || "";
							counter++;
						} else if (counter === 2 && line.startsWith("$")) {
							target = line.split("=")[0]?.trim().slice(1) || "";
							counter = 0;
							hotkeyData.push({
								key,
								type,
								target,
								name: target,
							});
						}
					}
				} catch (iniError) {
					console.error(`Error parsing .ini file ${entry.name}:`, iniError);
				}
			}

			// Recursively process children
			if (entry.isDir && entry.children.length > 0) {
				const [updatedChildren, childHK] = await detectHotkeys(entry.children, data, src);
				entry.children = updatedChildren;
				if (childHK.length > 0) {
					entry.keys = childHK;
				}
			}
		} catch (entryError) {
			console.error(`Error processing entry ${entry.name}:`, entryError);
		}
	}

	return [entries, hotkeyData];
}
export async function refreshModList() {
	try {
		const data = store.get(DATA);
		const modSrc = join(src, managedSRC);
		const modTgt = join(tgt, "Mods", managedTGT);

		await categorizeDir(modSrc);

		const entries = (await detectHotkeys(await readDirRecr(modSrc, "", 2), data, modSrc))[0]
			.map((entry) => entry.children)
			.flat()
			.sort(sortMods);

		// Batch process entries - separate rename operations from exists checks
		const renameOperations: Promise<void>[] = [];
		const existsChecks: Promise<{ entry: any; enabled: boolean }>[] = [];

		for (const entry of entries) {
			if (entry.name.startsWith("DISABLED")) {
				const newName = replaceDisabled(entry.name);
				const newPath = join(entry.parent, newName);

				renameOperations.push(
					rename(join(modSrc, entry.path), join(modSrc, newPath))
						.then(() => {
							entry.name = newName;
							entry.path = newPath;
						})
						.catch((error) => {
							console.error(`Error renaming ${entry.name}:`, error);
						})
				);
			}

			existsChecks.push(
				exists(join(modTgt, entry.path))
					.then((enabled) => ({ entry, enabled }))
					.catch(() => ({ entry, enabled: false }))
			);
		}

		// Wait for all renames to complete first
		await Promise.all(renameOperations);

		// Then process exists checks
		const existsResults = await Promise.all(existsChecks);
		for (const { entry, enabled } of existsResults) {
			entry.enabled = enabled;
		}

		return entries;
	} catch (error) {
		console.error("Error refreshing mod list:", error);
		throw error;
	}
}
export async function createModDownloadDir(cat: string, dir: string) {
	try {
		if (!cat || !dir) return;
		const path = join(src, managedSRC, cat, dir);
		if (await exists(path)) return path;
		await mkdir(path, { recursive: true });
		return path;
	} catch (error) {
		console.error("Error creating mod download directory:", error);
		throw error;
	}
}
export async function validateModDownload(path: string) {
	console.log(path);
	try {
		const entries = await readDir(path);
		const previewCount = entries.filter((entry) => entry.name.startsWith("preview.") && !entry.isDirectory).length;

		if (entries.length - previewCount === 1) {
			let hasIni = false;
			const dirs: string[] = [];

			for (const entry of entries) {
				if (entry.name.endsWith(".ini")) hasIni = true;
				if (entry.isDirectory) dirs.push(entry.name);
			}

			if (!hasIni && dirs.length === 1) {
				const uuid = "IMM_TEMP_" + Math.floor(Math.random() * 1000000000);
				const tempPath = path + "\\" + uuid;
				const dirPath = path + "\\" + dirs[0];

				try {
					await rename(dirPath, tempPath);
					await copyDir(tempPath, path);
					await remove(tempPath, { recursive: true });
				} catch (error) {
					console.error("Error flattening mod directory structure:", error);
				}
			}
		}
	} catch (error) {
		console.error("Error validating mod download:", error);
	}
	return true;
}
export async function changeModName(path: any, newPath: string) {
	try {
		const enabled = await toggleMod(path, false);
		await mkdir(join(src, managedSRC, ...newPath.split("\\").slice(0, -1)), { recursive: true });
		await rename(join(src, managedSRC, path), join(src, managedSRC, newPath));
		if (enabled) await toggleMod(newPath, true);
		return newPath;
	} catch (error) {
		console.error("Error changing mod name:", error);
		throw error;
	}
}
export async function deleteMod(path: any) {
	const modSrc = join(src, managedSRC, path);
	const modTgt = join(tgt, "Mods", managedTGT, path);

	try {
		await remove(modTgt);
	} catch (error) {
		console.error("Error removing mod target:", error);
	}

	try {
		await remove(modSrc, { recursive: true });
	} catch (error) {
		console.error("Error removing mod source:", error);
		throw error;
	}
}
export async function toggleMod(path: any, enabled: boolean) {
	try {
		const modSrc = join(src, managedSRC, path);
		const modTgt = join(tgt, "Mods", managedTGT, path);

		if (enabled) {
			const [srcExists, tgtExists] = await Promise.all([exists(modSrc), exists(modTgt)]);

			if (srcExists && !tgtExists) {
				await mkdir(join(tgt, "Mods", managedTGT, ...path.split("\\").slice(0, -1)), { recursive: true });
				try {
					await invoke("create_symlink", {
						linkPath: modTgt,
						targetPath: modSrc,
					});
				} catch (error) {
					console.error("Error creating symlink:", error);
					return false;
				}
			}
		} else {
			try {
				await remove(modTgt);
			} catch (error) {
				console.error("Error removing mod:", error);
				return false;
			}
		}
		return true;
	} catch (error) {
		console.error("Error toggling mod:", error);
		return false;
	}
}
export async function savePreviewImage(path: string) {
	try {
		path = join(src, managedSRC, path);
		const file = await open({
			multiple: false,
			directory: false,
			filters: [{ name: "Image", extensions: ["png", "jpg", "jpeg", "webp", "gif"] }],
		});

		if (!file) return;

		// Remove existing preview images in parallel
		const exts = ["png", "jpg", "jpeg", "webp", "gif"];
		const removePromises = exts.map((ext) =>
			remove(path + "\\" + "preview." + ext).catch(() => {
				// Ignore errors if file doesn't exist
			})
		);
		await Promise.all(removePromises);

		// Copy new preview image
		const fileExt = file.split(".").pop();
		await copyFile(file, path + "\\" + "preview." + fileExt);
		store.set(LAST_UPDATED, Date.now());
	} catch (error) {
		console.error("Error saving preview image:", error);
		throw error;
	}
}

export async function applyPreset(data: any) {
	try {
		await remove(join(tgt, "Mods", managedTGT), { recursive: true });
		await mkdir(join(tgt, "Mods", managedTGT), { recursive: true });

		// Apply mods in parallel batches to improve performance
		const batchSize = 10;
		for (let i = 0; i < data.length; i += batchSize) {
			const batch = data.slice(i, i + batchSize);
			await Promise.all(
				batch.map((mod: any) =>
					toggleMod(mod, true).catch((error) => {
						console.error(`Error toggling mod ${mod}:`, error);
					})
				)
			);
		}
	} catch (error) {
		console.error("Error applying preset:", error);
		throw error;
	}
}
