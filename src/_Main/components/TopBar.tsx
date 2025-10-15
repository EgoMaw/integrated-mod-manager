import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
	LEFT_SIDEBAR_OPEN,
	ONLINE,
	ONLINE_PATH,
	ONLINE_SORT,
	ONLINE_TYPE,
	RIGHT_SIDEBAR_OPEN,
	RIGHT_SLIDEOVER_OPEN,
	SEARCH,
	TEXT_DATA,
} from "@/utils/vars";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
	DownloadIcon,
	EyeIcon,
	PanelLeftCloseIcon,
	PanelLeftOpenIcon,
	PanelRightCloseIcon,
	PanelRightOpenIcon,
	SearchIcon,
	ThumbsUpIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

function TopBar() {
	const [leftSidebarOpen, setLeftSidebarOpen] = useAtom(LEFT_SIDEBAR_OPEN);
	const [rightSidebarOpen, setRightSidebarOpen] = useAtom(RIGHT_SIDEBAR_OPEN);
	const [rightSlideOverOpen, setRightSlideOverOpen] = useAtom(RIGHT_SLIDEOVER_OPEN);
	const [onlineType, setOnlineType] = useAtom(ONLINE_TYPE);
	const [onlineSort, setOnlineSort] = useAtom(ONLINE_SORT);
	const [popoverOpen, setPopoverOpen] = useState(false);
	const [onlinePath, setOnlinePath] = useAtom(ONLINE_PATH);
	const [search, setSearch] = useAtom(SEARCH);
	const [term, setTerm] = useState("");
	const textData = useAtomValue(TEXT_DATA);
	const online = useAtomValue(ONLINE);
	useEffect(() => {
		const handler = setTimeout(
			() => {
				if (online) {
					if (term.trim() === "") {
						setOnlinePath("home&type=" + onlineType);
					} else {
						setOnlinePath(`search/${term}&_type=${onlineType}`);
					}
				} else setSearch(term);
			},
			online ? 250 : 100
		);
		return () => {
			clearTimeout(handler);
		};
	}, [term]);
	useEffect(() => {
		let searchInput = (document.getElementById("search-input") as HTMLInputElement) || null;
		if (searchInput) {
			searchInput.value = "";
		}
	}, [online]);
	useEffect(() => {
		let searchInput = null as HTMLInputElement | null;
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.keyCode == 116) window.location.reload(); // F5
			if (event.keyCode > 111 && event.keyCode < 124) return; // F1-F12
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
				className="bg-background border-background hover:border-border hover:bg-sidebar flex items-center justify-center w-10 h-10 p-2 duration-200 border rounded-lg"
			>
				<PanelLeftCloseIcon
					className=" w-6 h-full text-accent duration-200 stroke-1"
					style={{
						width: leftSidebarOpen ? "1.5rem" : "0rem",
					}}
				/>
				<PanelLeftOpenIcon
					className=" w-6 h-full text-accent duration-200 stroke-1"
					style={{
						width: leftSidebarOpen ? "0rem" : "1.5rem",
					}}
				/>
			</div>
			<div className="bg-sidebar flex items-center justify-between w-full h-full px-3 py-1 overflow-hidden border rounded-lg">
				<SearchIcon className="text-muted-foreground flex-shrink-0 w-4 h-4 mr-2" />
				<Input
					id="search-input"
					defaultValue={online ? "" : search}
					placeholder="Search..."
					className="text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 flex-1 h-8 bg-transparent border-0"
					onChange={(e) => {
						setTerm(e.target.value);
					}}
					onBlur={(e) => {
						setTerm(e.target.value);
					}}
				/>
			</div>
			<div className="bg-sidebar data-zzz:bg-transparent w-32 h-full border data-zzz:border-0 rounded-lg">
				{online ? (
					<Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
						<PopoverTrigger asChild>
									
							<div className="min-w-fit trs data-zzz:bg-button p-2 rounded-md data-zzz:border-2 hover:brightness-150 text-xs bg-sidebar flex items-center justify-center w-full h-full gap-1 duration-300 cursor-pointer select-none">
								{onlinePath.startsWith("home") || onlinePath.startsWith("search")
									? onlineType == "Mod"
										? textData._Main._components._Navbar.ModsOnly
										: "All"
									: onlineSort == ""
									? "Default"
									: {
											Generic_MostLiked: (
												<>
													{textData._Main._components._Navbar.Most} <ThumbsUpIcon className="h-4" />
												</>
											),
											Generic_MostViewed: (
												<>
													{textData._Main._components._Navbar.Most} <EyeIcon className="h-4" />
												</>
											),
											Generic_MostDownloaded: (
												<>
													{textData._Main._components._Navbar.Most} <DownloadIcon className="h-4" />
												</>
											),
									  }[onlineSort]}
							</div>
						</PopoverTrigger>
						<PopoverContent className="bg-sidebar data-zzz:bg-transparent z-100 absolute w-32 data-zzz:w-28 p-0 my-2 mr-2 -ml-16 border data-zzz:border-0 rounded-lg">
							<div className="flex data-zzz:gap-2 flex-col" onClick={() => setPopoverOpen(false)}>
								{onlinePath.startsWith("home") || onlinePath.startsWith("search") ? (
									<>
										<div
											className="hover:brightness-150  trs data-zzz:bg-button p-2 rounded-md data-zzz:border-2  bg-sidebar min-h-12 flex items-center justify-center w-full gap-1 text-sm duration-300 border-b cursor-pointer select-none"
											onClick={() => {
												setOnlineType("");
												setOnlinePath((prev) => `${prev.split("&_type=")[0]}&_type=`);
												// setSettings((prev) => ({ ...prev, onlineType: "" }));
												// saveConfig();
											}}
										>
											{textData.generic.All}
										</div>
										<div
											className="hover:brightness-150 bg-sidebar trs data-zzz:bg-button p-2 rounded-md data-zzz:border-2  min-h-12 flex items-center justify-center w-full gap-1 text-sm duration-300 border-t cursor-pointer select-none"
											onClick={() => {
												setOnlineType("Mod");
												setOnlinePath((prev) => `${prev.split("&_type=")[0]}&_type=Mod`);
												// setSettings((prev) => ({ ...prev, onlineType: "Mod" }));
												// saveConfig();
											}}
										>
											{textData._Main._components._Navbar.ModsOnly}
										</div>
									</>
								) : (
									<>
										<div
											className="hover:brightness-150 trs data-zzz:bg-button p-2 rounded-md data-zzz:border-2  bg-sidebar min-h-12 flex items-center justify-center w-full gap-1 text-sm duration-300 border-b cursor-pointer select-none"
											onClick={() => {
												setOnlineSort("");
												setOnlinePath((prev) => `${prev.split("&_sort=")[0]}&_sort=`);
											}}
										>
											{textData._Main._components._Navbar.Default}
										</div>
										<div
											className="hover:brightness-150 trs data-zzz:bg-button p-2 rounded-md data-zzz:border-2  border-y bg-sidebar min-h-12 flex items-center justify-center w-full gap-1 text-sm duration-300 cursor-pointer select-none"
											onClick={() => {
												setOnlineSort("Generic_MostLiked");
												setOnlinePath((prev) => `${prev.split("&_sort=")[0]}&_sort=most_liked`);
											}}
										>
											{textData._Main._components._Navbar.Most} <ThumbsUpIcon className="h-4" />
										</div>
										<div
											className="hover:brightness-150 trs data-zzz:bg-button p-2 rounded-md data-zzz:border-2  border-y bg-sidebar min-h-12 flex items-center justify-center w-full gap-1 text-sm duration-300 cursor-pointer select-none"
											onClick={() => {
												setOnlineSort("Generic_MostViewed");
												setOnlinePath((prev) => `${prev.split("&_sort=")[0]}&_sort=most_viewed`);
											}}
										>
											{textData._Main._components._Navbar.Most} <EyeIcon className="h-4" />
										</div>
										<div
											className="hover:brightness-150 trs data-zzz:bg-button p-2 rounded-md data-zzz:border-2  bg-sidebar min-h-12 flex items-center justify-center w-full gap-1 text-sm duration-300 border-t cursor-pointer select-none"
											onClick={() => {
												setOnlineSort("Generic_MostDownloaded");
												setOnlinePath((prev) => `${prev.split("&_sort=")[0]}&_sort=most_downloaded`);
											}}
										>
											{textData._Main._components._Navbar.Most} <DownloadIcon className="h-4" />
										</div>
									</>
								)}
							</div>
						</PopoverContent>
					</Popover>
				) : (
					<></>
				)}
			</div>
			<div
				onClick={(e) => {
					e.stopPropagation();

					online ? setRightSlideOverOpen((prev: boolean) => !prev) : setRightSidebarOpen((prev: boolean) => !prev);
				}}
				className="bg-background border-background hover:border-border hover:bg-sidebar flex items-center justify-center w-10 h-10 p-2 duration-200 border rounded-lg"
			>
				<PanelRightOpenIcon
					className="text-accent  w-6 h-full duration-200 stroke-1"
					style={{
						width: (online ? rightSlideOverOpen : rightSidebarOpen) ? "0rem" : "1.5rem",
					}}
				/>
				<PanelRightCloseIcon
					className="text-accent  w-6 h-full duration-200 stroke-1"
					style={{
						width: (online ? rightSlideOverOpen : rightSidebarOpen) ? "1.5rem" : "0rem",
					}}
				/>
			</div>
		</div>
	);
}

export default TopBar;
