import { Input } from "@/components/ui/input";
import { LEFT_SIDEBAR_OPEN, ONLINE, RIGHT_SIDEBAR_OPEN, SEARCH } from "@/utils/vars";
import { useAtom, useAtomValue } from "jotai";
import { PanelLeftCloseIcon, PanelLeftOpenIcon, PanelRightCloseIcon, PanelRightOpenIcon, SearchIcon } from "lucide-react";
import { useEffect } from "react";

function TopBar() {
	const [leftSidebarOpen, setLeftSidebarOpen] = useAtom(LEFT_SIDEBAR_OPEN);
	const [rightSidebarOpen, setRightSidebarOpen] = useAtom(RIGHT_SIDEBAR_OPEN);
	const online = useAtomValue(ONLINE);
	const [search, setSearch] = useAtom(SEARCH);
	useEffect(() => {
		let searchInput = (document.getElementById("search-input") as HTMLInputElement) || null;
		if (searchInput) {
			searchInput.value = "";
		}
	}, [online]);
	useEffect(() => {
		let searchInput = null as HTMLInputElement | null;
		const handleKeyDown = (event: KeyboardEvent) => {
			if (!searchInput) searchInput = (document.getElementById("search-input") as HTMLInputElement) || null;

			if (!event.ctrlKey && !event.altKey && !event.shiftKey && !event.metaKey) {
				let activeEl = document.activeElement;
				if (activeEl?.tagName === "BUTTON") activeEl = null;
				if (activeEl === document.body || activeEl === null) searchInput.focus();
				else if (event.code === "Escape" && activeEl === searchInput) {
					searchInput.value = "";
					searchInput.blur();
				}
			}
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, []);
	return (
		<div className="text-accent min-h-16 flex items-center justify-center w-full h-16 gap-2 p-2">
			<div
				onClick={(e) => {
					e.stopPropagation();
					setLeftSidebarOpen((prev: boolean) => !prev);
				}}
				className="bg-background border-background hover:border-border hover:bg-sidebar text-accent flex items-center justify-center w-10 h-10 p-2 duration-200 border rounded-lg"
			>
				<PanelLeftCloseIcon
					className=" w-6 h-full duration-200 stroke-1"
					style={{
						width: leftSidebarOpen ? "1.5rem" : "0rem",
					}}
				/>
				<PanelLeftOpenIcon
					className=" w-6 h-full duration-200 stroke-1"
					style={{
						width: leftSidebarOpen ? "0rem" : "1.5rem",
					}}
				/>
			</div>
			<div className="bg-sidebar flex items-center justify-between w-full h-full px-3 py-1 overflow-hidden border rounded-lg">
				<SearchIcon className="text-muted-foreground flex-shrink-0 w-4 h-4 mr-2" />
				<Input
					id="search-input"
					defaultValue={online?"":search}
					placeholder="Search..."
					className="text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 flex-1 h-8 bg-transparent border-0"
					onChange={(e) => {
						// if (online) {
						// 	if (e.target.value.trim() === "") {
						// 		setOnlinePath("home&type=" + onlineType);
						// 	} else {
						// 		setOnlinePath(`search/${e.target.value}&_type=${onlineType}`);
						// 	}
						// } else setLocalSearchTerm(e.target.value);
						setSearch(e.target.value);
					}}
					onBlur={(e) => {
						if (online) {
							// if (e.target.value.trim() === "") {
							// 	setOnlinePath("home&type=" + onlineType);
							// } else {
							// 	setOnlinePath(`search/${e.target.value}&_type=${onlineType}`);
							// }
						}
					}}
				/>
			</div>
			<div className="bg-sidebar w-32 h-full overflow-hidden border rounded-lg"></div>
			<div
				onClick={(e) => {
					e.stopPropagation();
					setRightSidebarOpen((prev: boolean) => !prev);
				}}
				className="bg-background border-background hover:border-border hover:bg-sidebar text-accent flex items-center justify-center w-10 h-10 p-2 duration-200 border rounded-lg"
			>
				<PanelRightOpenIcon
					className=" w-6 h-full duration-200 stroke-1"
					style={{
						width: rightSidebarOpen ? "0rem" : "1.5rem",
					}}
				/>
				<PanelRightCloseIcon
					className=" w-6 h-full duration-200 stroke-1"
					style={{
						width: rightSidebarOpen ? "1.5rem" : "0rem",
					}}
				/>
			</div>
		</div>
	);
}

export default TopBar;
