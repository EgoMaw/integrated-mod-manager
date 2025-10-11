import { Button } from "@/components/ui/button";
import { UNCATEGORIZED } from "@/utils/consts";
import { CATEGORIES, CATEGORY, MOD_LIST, ONLINE, TEXT_DATA } from "@/utils/vars";
import { useAtom, useAtomValue } from "jotai";
import { FileQuestionIcon, GroupIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo } from "react";

function BottomBar() {
	const textData = useAtomValue(TEXT_DATA);
	const [category, setCategory] = useAtom(CATEGORY);
	const online = useAtomValue(ONLINE);
	const modList = useAtomValue(MOD_LIST);
	const categories = useAtomValue(CATEGORIES);
	const localCategories = useMemo(() => {
		return online
			? categories
			: [
					{ _sName: "All", _sIconUrl: "/icons/all.png", _special: true },
					...(modList.some((mod: any) => mod.parent == UNCATEGORIZED)
						? [{ _sName: UNCATEGORIZED, _sIconUrl: "/icons/uncategorized.png", _special: true }]
						: []),
					...categories.filter((cat: any) => modList.some((mod: any) => mod.parent == cat._sName)),
			  ];
	}, [categories, modList, online]);
	console.log(localCategories);
	return (
		<div className="min-h-20 flex items-center justify-center w-full h-20 p-2">
			<div className="bg-sidebar text-accent flex items-center justify-center w-full h-full gap-1 p-2 border rounded-lg">
				<label className="w-20 gap-1">{textData.generic.Category}</label>:
				<div
					onWheel={(e) => {
						if (e.deltaX != 0) return;
						let target = e.currentTarget as HTMLDivElement;
						target.scrollTo({
							left: target.scrollLeft + e.deltaY,
							// behavior: "smooth",
						});
					}}
					className=" h-15 items-top thin flex items-center justify-start w-full gap-2 p-2 my-1 mr-1 overflow-x-auto overflow-y-hidden text-white"
				>
					<AnimatePresence mode="popLayout">
						{localCategories.map((cat: any) => (
							<motion.div
								initial={{ opacity: 0, y: "100%" }}
								animate={{ opacity: 1, y: "0%" }}
								exit={{ opacity: 0, y: "100%" }}
								key={cat._sName}
								layout
							>
								<Button
									key={cat._sName}
									onClick={() => {
										if (online) {
										} else {
											setCategory(cat._sName);
										}
										// if (online) {
										// 	if (category._special) {
										// 		return;
										// 	}
										// 	if (onlinePath.startsWith("Skins/" + category._sName)) {
										// 		setOnlinePath("home&type=" + onlineType);
										// 		return;
										// 	}
										// 	setOnlinePath(`Skins/${category._sName}&_sort=${onlineSort}`);
										// } else {
										// 	setSelectedCategory(category._sName);
										// }
									}}
									style={{
										scale: online && cat._special ? "0" : "1",
										marginRight: online && cat._special ? "-9.5rem" : "0rem",
										padding: online && cat._special ? "0rem" : "",
									}}
									className={
										(online ? /*onlinePath.startsWith(`Skins/${category._sName}`)*/ false : category == cat._sName)
											? " bg-accent text-background"
											: ""
									}
								>
									{cat._sName == "All" ? (
										<GroupIcon className="aspect-square h-full pointer-events-none" />
									) : cat._sName == UNCATEGORIZED ? (
										<FileQuestionIcon className="aspect-square h-full pointer-events-none" />
									) : (
										<img
											className="aspect-square min-w-6 scale-120 h-full rounded-full pointer-events-none"
											onError={(e) => {
												e.currentTarget.src = "/who.jpg";
											}}
											src={cat._sIconUrl || "err"}
										/>
									)}
									{cat._sName}
								</Button>
							</motion.div>
						))}
					</AnimatePresence>
				</div>
			</div>
		</div>
	);
}

export default BottomBar;
