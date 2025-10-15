import { useAtom, useAtomValue, useSetAtom } from "jotai";
import "./App.css";
import {
	CHANGES,
	GAME,
	INIT_DONE,
	LANG,
	LEFT_SIDEBAR_OPEN,
	MOD_LIST,
	ONLINE,
	ONLINE_SELECTED,
	RIGHT_SIDEBAR_OPEN,
	RIGHT_SLIDEOVER_OPEN,
	SETTINGS,
} from "./utils/vars";
import { AnimatePresence, motion } from "motion/react";
import Checklist from "./_Checklist/Checklist";
import { initializeThemes } from "./utils/theme";
import Changes from "./_Changes/Changes";
import { useCallback, useEffect, useMemo, useState } from "react";
import { refreshModList, saveConfigs } from "./utils/filesys";
import { SidebarProvider } from "./components/ui/sidebar";
import LeftSidebar from "./_LeftSidebar/Left";
import Main from "./_Main/Main";
import RightLocal from "./_RightSidebar/RightLocal";
import RightOnline from "./_RightSidebar/RightOnline";
import { modRouteFromURL } from "./utils/utils";
import { main } from "./utils/init";
import { Button } from "./components/ui/button";

initializeThemes();
main();
function App() {
	const initDone = useAtomValue(INIT_DONE);
	const lang = useAtomValue(LANG);
	const [online, setOnline] = useAtom(ONLINE);
	const game = useAtomValue(GAME);
	const changes = useAtomValue(CHANGES);
	const settings = useAtomValue(SETTINGS);
	const leftSidebarOpen = useAtomValue(LEFT_SIDEBAR_OPEN);
	const setOnlineSelected = useSetAtom(ONLINE_SELECTED);
	const [rightSidebarOpen, setRightSidebarOpen] = useAtom(RIGHT_SIDEBAR_OPEN);
	const [rightSlideOverOpen, setRightSlideOverOpen] = useAtom(RIGHT_SLIDEOVER_OPEN);
	const setModList = useSetAtom(MOD_LIST);
	const [showModeSwitch, setShowModeSwitch] = useState(false);
	const [previousOnline, setPreviousOnline] = useState(online);
	const afterInit = useCallback(async () => {
		saveConfigs();
		setModList(await refreshModList());
		return Promise.resolve();
	}, []);
	// useEffect(() => {
	// 	if (initDone) {
	// 		afterInit();
	// 	}
	// }, [initDone]);
	useEffect(() => {
		const handlePaste = (event: ClipboardEvent) => {
			let activeEl = document.activeElement;
			if (activeEl?.tagName === "BUTTON") activeEl = null;
			if (activeEl === document.body || activeEl === null) {
				let text = event.clipboardData?.getData("Text");
				if (text?.startsWith("http")) {
					event.preventDefault();
					let mod = modRouteFromURL(text);
					if (mod) {
						setOnline(true);
						setOnlineSelected(mod);
					}
				}
			}
		};
		document.addEventListener("paste", handlePaste);
		return () => document.removeEventListener("paste", handlePaste);
	}, []);

	// Handle mode switch animation
	useEffect(() => {
		if (previousOnline !== online) {
			setShowModeSwitch(true);
			setPreviousOnline(online);
			const timer2 = setTimeout(
				() => {
					setRightSidebarOpen(!online);
				},
				online ? 300 : 0
			);

			const timer = setTimeout(() => {
				setShowModeSwitch(false);
			}, 1000);

			return () => {
				clearTimeout(timer);
				clearTimeout(timer2);
			};
		}
		return undefined;
	}, [online]);
	const leftSidebarStyle = useMemo(
		() => ({
			minWidth: leftSidebarOpen ? "20.95rem" : "3.95rem",
		}),
		[leftSidebarOpen]
	);
	const rightSidebarStyle = useMemo(
		() => ({
			minWidth: rightSidebarOpen ? "20.95rem" : "0rem",
		}),
		[rightSidebarOpen]
	);
	//console.log(!initDone, !lang, !game, changes, lang);
	return (
		<div id="background" className="flex flex-row fixed justify-start items-start w-full h-full game-font">
			<div
				className="fixed h-screen w-screen bg-bgg "
				style={{
					opacity: (settings.global.bgOpacity || 1) * 0.1,
					animation: settings.global.bgType == 2 ? "moveDiagonal 15s linear infinite" : "",
					backgroundImage: settings.global.bgType == 0 ? "none" : "",
					backgroundRepeat: settings.global.bgType == 0 ? "no-repeat" : "",
				}}
			></div>
			<SidebarProvider open={leftSidebarOpen}>
				<LeftSidebar />
			</SidebarProvider>
			<SidebarProvider open={rightSidebarOpen}>
				<RightLocal />
			</SidebarProvider>

			<RightOnline open={online && rightSlideOverOpen} />

			<div className="w-full h-full fixed flex flex-row">
				<div className="h-full duration-200 ease-linear" style={leftSidebarStyle} />
				<Main />
				<div className="h-full duration-200 ease-linear" style={rightSidebarStyle} />
			</div>
			<div className="w-full pointer-events-none h-full fixed flex flex-row">
				<div className="h-full duration-200 ease-linear" style={leftSidebarStyle} />
				<AnimatePresence>
					{online && rightSlideOverOpen && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.3 }}
							onClick={() => setRightSlideOverOpen(false)}
							className="w-full pointer-events-auto h-full bg-background/40 backdrop-blur-[2px]"
						/>
					)}
				</AnimatePresence>
			</div>

			{/* Mode Switch Indicator */}

			<AnimatePresence>{(!initDone || !lang || !game) && <Checklist />}</AnimatePresence>
			<AnimatePresence>{changes.title && <Changes afterInit={afterInit} />}</AnimatePresence>
			{/* <div className="pointer-events-none fixed h-screen w-screen opacity-0 z-20 backdrop-blur-md bg-background/50 duration-300">

			</div> */}
			<Button onClick={()=>{
				// toast.success("This is a success message",{className:" bg-white"});
			}} className="fixed w-20 h-10 z-1000" >
				Sonner</Button>
			 
		</div>
	);
}
export default App;
{/* <AnimatePresence>
				{showModeSwitch&&false && (
					<motion.div
						initial={{ opacity: 0, filter: "blur(6px)" }}
						animate={{ opacity: 1, filter: "blur(0px)" }}
						exit={{ opacity: 0, filter: "blur(6px)" }}
						transition={{ duration: 0.3, ease: "easeInOut" }}
						className="z-10 bg-background/50 flex items-center justify-center flex-col backdrop-blur-md fixed w-screen h-screen"
					>
						{/* Icon Container with Relative Positioning */}
					// 	<div className="relative flex items-center justify-center w-32 h-32 mb-4">
					// 		{/* Online Icon (Globe) */}
					// 		<AnimatePresence mode="wait">
					// 			<motion.div
					// 				key="online-icon"
					// 				initial={online ? { x: 100, opacity: 0, scale: 0.5 } : { x: 0, opacity: 1, scale: 1 }}
					// 				animate={!online ? { x: 100, opacity: 0, scale: 0.5 } : { x: 0, opacity: 1, scale: 1 }}
					// 				transition={{ duration: 0., ease: "easeInOut", delay: 0.1 }}
					// 				className="absolute flex items-center justify-center"
					// 			>
					// 				<GlobeIcon className="min-w-12 min-h-12 text-accent animate-pulse" />
					// 			</motion.div>

					// 			<motion.div
					// 				key="local-icon"
					// 				initial={!online ? { x: -100, opacity: 0, scale: 0.5 } : { x: 0, opacity: 1, scale: 1 }}
					// 				animate={online ? { x: -100, opacity: 0, scale: 0.5 } : { x: 0, opacity: 1, scale: 1 }}
					// 				transition={{ duration: 0.3, ease: "easeInOut", delay: 0.1 }}
					// 				className="absolute flex items-center justify-center flex-col"
					// 			>
					// 				<ArrowDownIcon className="min-w-8 min-h-8 download text-accent mb-1 animate-pulse" />
					// 				<HardDriveIcon className="min-w-12 min-h-12 text-accent animate-pulse" />
					// 			</motion.div>
					// 		</AnimatePresence>
					// 	</div>

					// 	<div className="text-foreground text-lg font-semibold">{online ? "Online Mode" : "Local Mode"}</div>
					// 	<div className="text-muted-foreground text-sm mt-1">
					// 		{online ? "Browse community mods" : "Manage local mods"}
					// 	</div>
					// </motion.div>
			// 	)}
			// </AnimatePresence> */}