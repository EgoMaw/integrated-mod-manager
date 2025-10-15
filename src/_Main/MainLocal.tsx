import {
	CATEGORY,
	DATA,
	FILTER,
	INIT_DONE,
	LAST_UPDATED,
	MOD_LIST,
	SEARCH,
	SELECTED,
	SETTINGS,
	TEXT_DATA,
} from "@/utils/vars";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { AnimatePresence, motion } from "motion/react";
import CardLocal from "./components/CardLocal";
import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { preventContextMenu } from "@/utils/utils";
import { deleteMod, saveConfigs, toggleMod } from "@/utils/filesys";
import MiniSearch from "minisearch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent } from "@/components/ui/alert-dialog";
import { setChange } from "@/utils/hotreload";

let searchDB: any = null;
let prev = "prev";
let prevEnabled = "noData";
function MainLocal() {
	const initDone = useAtomValue(INIT_DONE);
	const [alertOpen, setAlertOpen] = useState(false);
	const [deleteItemData, setDeleteItemData] = useState<any>(null);
	const textData = useAtomValue(TEXT_DATA);
	const [initial, setInitial] = useState(true);
	const lastUpdated = useAtomValue(LAST_UPDATED);
	const [modList, setModList] = useAtom(MOD_LIST);
	const category = useAtomValue(CATEGORY);
	const filter = useAtomValue(FILTER);
	const search = useAtomValue(SEARCH);
	const setData = useSetAtom(DATA);
	const [filteredList, setFilteredList] = useState([] as any[]);
	const [visibleRange, setVisibleRange] = useState({ start: -1, end: -1 });
	const [selected, setSelected] = useAtom(SELECTED);
	const containerRef = useRef<any>(null);
	const toggleOn = useAtomValue(SETTINGS).global.toggleClick;
	const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
	const keyRef = useRef<any>(null);
	useEffect(() => {
		if (!searchDB && modList.length > 0) {
			searchDB = new MiniSearch({
				idField: "name",
				fields: ["name", "parent", "path"],
				storeFields: Object.keys(modList[0]),
				searchOptions: { prefix: true, fuzzy: 0.2 },
			});
		}
		if (searchDB) {
			searchDB.removeAll();
			searchDB.addAll(modList);
		}

		if (!initDone) {
			prevEnabled = "noData";
		} else {
			const enabled = modList
				.filter((m: any) => m.enabled)
				.map((m: any) => m.path)
				.join(",");
			if (prevEnabled !== "noData" && prevEnabled !== enabled) {
				setChange();
			}

			prevEnabled = enabled;
		}
	}, [modList]);
	useEffect(() => {
		keyRef.current = `${filter}-${category}-${search}-${modList.length}`;
		if (prev !== keyRef.current) {
			if (containerRef.current) {
				containerRef.current.scrollTo({ top: 0 });
			}
			setVisibleRange({ start: -1, end: -1 });
			setInitial(true);
		}
		prev = keyRef.current;
		let newList: any = searchDB && search ? searchDB.search(search) : [...modList];
		if (filter != "All") {
			newList = newList.filter((mod: any) => mod.enabled == (filter == "Enabled"));
		}
		if (category != "All") {
			newList = newList.filter((mod: any) => mod.parent == category);
		}
		setFilteredList(newList);
	}, [modList, filter, category, search]);

	const handleClick = useCallback(
		(e: MouseEvent, mod: any) => {
			const click = e.button;
			let tag = (e.target as HTMLElement).tagName.toLowerCase();
			if (tag == "button") {
				if (!mod) return;
				setDeleteItemData((prev: any) => {
					if (prev) return prev;
					setAlertOpen(true);
					return mod;
				});
				return setSelected(mod.path);
			}
			if (click == toggleOn) {
				toggleMod(mod.path, !mod.enabled);
				setModList((prev: any) => {
					return prev.map((m: any) => {
						if (m.path == mod.path) {
							return { ...m, enabled: !m.enabled };
						}
						return m;
					});
				});
			} else setSelected(mod.path == selected ? "" : mod.path);
		},
		[selected, setSelected, toggleOn, setModList]
	);
	const handleScroll = useCallback(() => {
		if (initial) {
			setInitial(false);
		}
		if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
		scrollTimeoutRef.current = setTimeout(() => {
			if (containerRef.current) {
				const box = containerRef.current.getBoundingClientRect();
				const scrollTop = containerRef.current.scrollTop;
				const itemHeight = 320;
				const itemWidth = 256;
				const itemsPerRow = Math.floor(box.width / itemWidth);
				setVisibleRange({
					start: Math.floor(scrollTop / itemHeight) * itemsPerRow,
					end: Math.ceil((scrollTop + box.height) / itemHeight) * itemsPerRow - 1,
				});
			}
		}, 50);
	}, [initial]);

	// Memoize animation variants to prevent recreation on every render
	const animationVariants = useCallback(
		() => ({
			hidden: { opacity: initial ? 0 : 1, y: 20 },
			visible: { opacity: 1, y: 0 },
			exit: { opacity: initial ? 0 : 1, y: -20 },
			invisible: { opacity: 0 },
		}),
		[initial]
	);
	useEffect(() => {
		if (!alertOpen) {
			setDeleteItemData(null);
		}
	}, [alertOpen]);
	// Memoize transition config
	const transitionConfig = useCallback(
		(index: number) => ({
			duration: 0.3,
			ease: "easeOut",
			delay: initial ? 0.05 * index : 0,
		}),
		[initial]
	);

	// Determine if item should be visible
	const isItemVisible = useCallback(
		(index: number) => {
			const { start, end } = visibleRange;
			return start === -1 || (index >= start && index <= end) ? 0 : index < start ? 2 : 1;
		},
		[visibleRange]
	);
	return (
		<div
			ref={containerRef}
			onScroll={handleScroll}
			className="flex flex-col  overflow-x-hidden items-center h-screen w-full  overflow-y-auto duration-300"
		>
			{" "}
			<AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
				<AlertDialogContent className="min-w-120">
					<div className="max-w-96 flex flex-col items-center gap-6 mt-6 text-center">
						<div className="text-xl text-gray-200">
							{textData._Main._MainLocal.Delete} <span className="text-accent ">{deleteItemData?.name}</span>?
						</div>
						<div className="text-red-300	">{textData._Main._MainLocal.Irrev}</div>
					</div>
					<div className="flex justify-between w-full gap-4 mt-4">
						<AlertDialogCancel className="w-24 duration-300">{textData.generic.Cancel}</AlertDialogCancel>
						<AlertDialogAction
							className="w-24 text-red-300 hover:bg-red-300 data-zzz:hover:text-background hover:text-background"
							onClick={async () => {
								if (!deleteItemData) return;
								setData((prev: any) => {
									const newData = { ...prev };
									if (deleteItemData.path) {
										delete newData[deleteItemData.path];
									}
									return newData;
								});
								deleteMod(deleteItemData.path);
								saveConfigs();
								setModList((prev: any) => {
									const newData = prev.filter((m: any) => m.path != deleteItemData.path);
									return newData;
								});
								setAlertOpen(false);
								setSelected("");
								// let items = await refreshRootDir("");
								// setRightSidebarOpen(false);
								// setLocalModList(items);
								// saveConfig();
							}}
						>
							{textData._Main._MainLocal.Delete}
						</AlertDialogAction>
					</div>
				</AlertDialogContent>
			</AlertDialog>
			<AnimatePresence mode="popLayout">
				<motion.div
					layout
					className="min-h-fit grid justify-center w-full py-4 card-grid"
					key={keyRef.current}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={transitionConfig(0)}
				>
					{filteredList.map((mod: any, index: number) => {
						const isVisible = isItemVisible(index);

						return (
							<motion.div
								key={mod.path + keyRef.current}
								layout
								variants={animationVariants()}
								initial="hidden"
								animate="visible"
								exit="exit"
								transition={transitionConfig(index)}
								onMouseUp={(e: any) => handleClick(e, mod)}
								onContextMenu={preventContextMenu}
							>
								{isVisible ? (
									<div className="card-generic"></div>
								) : (
									<CardLocal item={mod} selected={selected === mod.path} lastUpdated={lastUpdated} />
								)}
							</motion.div>
						);
					})}
				</motion.div>
			</AnimatePresence>
		</div>
	);
}

export default MainLocal;
