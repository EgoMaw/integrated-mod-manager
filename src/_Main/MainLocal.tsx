import { CATEGORY, FILTER, LAST_UPDATED, MOD_LIST, SEARCH, SELECTED, SETTINGS } from "@/utils/vars";
import { useAtom, useAtomValue } from "jotai";
import { AnimatePresence, motion } from "motion/react";
import CardLocal from "./components/CardLocal";
import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { preventContextMenu } from "@/utils/utils";
import { toggleMod } from "@/utils/filesys";
import MiniSearch from "minisearch";

let interval = null as any;
let timeout = null as any;
let searchDB: any = null;

function MainLocal() {
	const lastUpdated = useAtomValue(LAST_UPDATED);
	const [modList, setModList] = useAtom(MOD_LIST);
	const category = useAtomValue(CATEGORY);
	const filter = useAtomValue(FILTER);
	const search = useAtomValue(SEARCH);
	const [debouncedSearch, setDebouncedSearch] = useState(search);
	const [filteredList, setFilteredList] = useState([] as any[]);
	const [visibleRange, setVisibleRange] = useState({ start: -1, end: -1 });
	const [selected, setSelected] = useAtom(SELECTED);
	const containerRef = useRef<any>(null);
	const toggleOn = useAtomValue(SETTINGS).global.toggleClick;
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
	}, [modList]);
	useEffect(() => {
		console.log("SearchDB:", debouncedSearch);
		let newList: any = searchDB && debouncedSearch ? searchDB.search(debouncedSearch) : [...modList];
		if (filter != "All") {
			newList = newList.filter((mod: any) => mod.enabled == (filter == "Enabled"));
		}
		if (category != "All") {
			newList = newList.filter((mod: any) => mod.parent == category);
		}
		setFilteredList(newList);
	}, [modList, filter, category, debouncedSearch]);
	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedSearch(search);
		}, 300);
		return () => {
			clearTimeout(handler);
		};
	}, [search]);
	const handleClick = useCallback(
		(click: number, mod: any) => {
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
	const intervalFunction = useCallback(() => {
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
	}, [containerRef]);
	const handleScroll = useCallback(() => {
		if (!interval) {
			interval = setInterval(intervalFunction, 13);
		}
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(() => {
			clearInterval(interval);
			interval = null;
			timeout = null;
		}, 1000);
	}, []);

	// Memoize animation variants to prevent recreation on every render
	const animationVariants = useMemo(
		() => ({
			hidden: { opacity: 0, y: 20 },
			visible: { opacity: 1, y: 0 },
			exit: { opacity: 0, y: -20 },
		}),
		[]
	);

	// Memoize transition config
	const transitionConfig = useMemo(
		() => ({
			duration: 0.3,
			ease: "easeOut",
		}),
		[]
	);

	// Determine if item should be visible
	const isItemVisible = useCallback(
		(index: number) => {
			const { start, end } = visibleRange;
			return start === -1 || (index >= start && index <= end) ? 0 : index < start ? 2 : 1;
		},
		[visibleRange]
	);
	// console.log(visibleRange);
	return (
		<div
			ref={containerRef}
			onScroll={handleScroll}
			className="grid justify-center w-full h-full overflow-y-auto py-4 card-grid"
		>
			<AnimatePresence>
				{filteredList.map((mod: any, index: number) => {
					const isVisible = isItemVisible(index);

					return (
						<motion.div
							key={mod.path}
							layout
							variants={animationVariants}
							initial="hidden"
							animate={["visible", "hidden", "exit"][isVisible]}
							exit="exit"
							transition={transitionConfig}
							onMouseUp={(e) => handleClick(e.button, mod)}
							onContextMenu={preventContextMenu}
						>
							<CardLocal item={mod} selected={selected === mod.path} lastUpdated={lastUpdated} />
						</motion.div>
					);
				})}
			</AnimatePresence>
		</div>
	);
}

export default MainLocal;
