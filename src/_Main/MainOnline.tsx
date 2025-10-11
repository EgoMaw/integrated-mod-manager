import { apiClient } from "@/utils/api";
import { ONLINE_DATA, ONLINE_PATH, ONLINE_SELECTED, ONLINE_SORT, ONLINE_TYPE, SETTINGS } from "@/utils/vars";
import { useAtom, useAtomValue } from "jotai";
import { AnimatePresence, motion } from "motion/react";
import { MouseEvent, useEffect, useRef } from "react";
import Carousel from "./components/Carousel";
const pageCount = {} as any;
let loading = false;
let max = 0;
function MainOnline() {
	const containerRef = useRef(null as any);
	const nsfw = useAtomValue(SETTINGS).global.nsfw;
	const [onlineData, setOnlineData] = useAtom(ONLINE_DATA);
	const [onlineType, setOnlineType] = useAtom(ONLINE_TYPE);
	const [onlinePath, setOnlinePath] = useAtom(ONLINE_PATH);
	const [onlineSort, setOnlineSort] = useAtom(ONLINE_SORT);
	const [onlineSelected, setOnlineSelected] = useAtom(ONLINE_SELECTED);
	async function nextPage(url: string, onlinePath: string) {
		const res = await fetch(url);
		const data = await res.json();
		setOnlineData((prev: any) => {
			prev[onlinePath] = [...prev[onlinePath], ...data._aRecords];
			return {
				...prev,
			};
		});
		loading = false;
	}
	async function loadMore(e: any) {
		let lastChild = e.currentTarget.lastElementChild?.lastElementChild as HTMLDivElement;
		if (lastChild && !loading) {
			let lastChildRect = lastChild.getBoundingClientRect();
			if (lastChildRect.top < window.innerHeight) {
				loading = true;
				pageCount[onlinePath]++;
				if (max > 0 && pageCount[onlinePath] - 1 > max) {
					loading = false;
					return;
				}
				// updateInfo(`Loading page ${pageCount[onlinePath]}/${Math.ceil(max)}`, 1000);
				try {
					if (onlinePath.startsWith("home"))
						await nextPage(apiClient.home({ page: pageCount[onlinePath], type: onlineType }), onlinePath);
					else if (onlinePath.startsWith("Skins") || onlinePath.startsWith("Other") || onlinePath.startsWith("UI")) {
						let cat = onlinePath.split("&_sort=")[0];
						await nextPage(apiClient.category({ cat, sort: onlineSort, page: pageCount[onlinePath] }), onlinePath);
					} else if (onlinePath.startsWith("search/")) {
						let term = onlinePath.replace("search/", "").split("&_type=")[0];
						if (term.trim().length == 0) return;
						await nextPage(apiClient.search({ term, type: onlineType, page: pageCount[onlinePath] }), onlinePath);
					}
				} finally {
					//console.log(e);
					setTimeout(() => {
						loadMore(e as any);
					}, 100);
					loading = false;
				}
			}
		}
	}
	function initialLoad(url: string, onlinePath: string, controller: AbortController) {
		fetch(url, { signal: controller.signal })
			.then((res) => res.json())
			.then((data) => {
				max = data._nTotalRecords / (data?._nRecordsPerPage || 15);
				setOnlineData((prev: any) => {
					prev[onlinePath] = data._aRecords;
					return {
						...prev,
					};
				});
				setTimeout(() => {
					loadMore({ currentTarget: document.getElementById("online-items")! } as unknown as MouseEvent<
						HTMLDivElement,
						MouseEvent
					>);
				}, 100);
				loading = false;
			});
	}
	useEffect(() => {
		const controller = new AbortController();
		if (!pageCount[onlinePath]) {
			pageCount[onlinePath] = 1;
			loading = true;
			if (onlinePath.startsWith("home")) {
				fetch(apiClient.banner(), { signal: controller.signal }).then((res) =>
					res.json().then((data) => {
						setOnlineData((prev: any) => {
							return {
								...prev,
								banner: data || [],
							};
						});
					})
				);
				initialLoad(apiClient.home({ type: onlineType }), onlinePath, controller);
			}
		}
		return () => {
			controller.abort();
		};
	}, [onlinePath, onlineType]);
	return (
		<div ref={containerRef} className="flex flex-col items-center h-full min-w-full overflow-y-auto duration-300">
			<AnimatePresence>
				{onlineData?.banner && onlineData.banner.length > 0 && onlinePath.startsWith("home") && (
					<motion.div
						className="aspect-video bg- white w-full max-w-3xl duration-500"
						layout
						key={"banner"}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.5 }}
						// style={{
						// 	opacity: debouncedOnlinePath.startsWith("home") && onlineData.banner.length > 0 ? 1 : 0,
						// 	marginBottom: debouncedOnlinePath.startsWith("home") && onlineData.banner.length > 0 ? "1rem" : "-100%",
						// }}
					>
						<Carousel
							data={onlineData.banner.filter(
								(item: any) =>
									(item._sModelName == "Mod" || onlineType == "") && (nsfw || item._sInitialVisibility != "hide")
							)}
							blur={nsfw == 1}
							// onModClick={onModClick}
						/>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

export default MainOnline;
