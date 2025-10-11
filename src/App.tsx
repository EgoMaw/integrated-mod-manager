import { useAtom, useAtomValue, useSetAtom } from "jotai";
import "./App.css";
import { CHANGES, GAME, INIT_DONE, LANG,  LEFT_SIDEBAR_OPEN, MOD_LIST, ONLINE, RIGHT_SIDEBAR_OPEN, SETTINGS } from "./utils/vars";
import { AnimatePresence, motion } from "motion/react";
import Checklist from "./_Checklist/Checklist";
import { initializeThemes } from "./utils/theme";
import Changes from "./_Changes/Changes";
import { useCallback, useEffect, useMemo } from "react";
import { refreshModList, saveConfigs } from "./utils/filesys";
import { SidebarProvider } from "./components/ui/sidebar";
import LeftSidebar from "./_LeftSidebar/Left";
import RightSidebar from "./_RightSidebar/Right";
import Main from "./_Main/Main";
initializeThemes();
let prevRight = true
function App() {
	const initDone = useAtomValue(INIT_DONE);
	const lang = useAtomValue(LANG);
	const online = useAtomValue(ONLINE)
	const game = useAtomValue(GAME);
	const changes = useAtomValue(CHANGES);
	const settings = useAtomValue(SETTINGS);
	const leftSidebarOpen = useAtomValue(LEFT_SIDEBAR_OPEN);
	const [rightSidebarOpen, setRightSidebarOpen] = useAtom(RIGHT_SIDEBAR_OPEN);
	const setModList = useSetAtom(MOD_LIST);
	const afterInit = useCallback(async () => {
		saveConfigs();
		setModList(await refreshModList());
	}, []);
	useEffect(() => {
		if (initDone) {
			afterInit();
		}
	}, [initDone]);
	useEffect(() => {
		if(online){
			prevRight = rightSidebarOpen
			setRightSidebarOpen(false)
		}
		else{
			setRightSidebarOpen(prevRight)
		}
	}, [online]);
	const leftSidebarStyle = useMemo(
		() => ({
			minWidth: leftSidebarOpen ? "20.95rem" : "3.95rem",
		}),
		[leftSidebarOpen]
	);
	const rightSidebarStyle = useMemo(
		() => ({
			minWidth: /*online?"0rem":*/ rightSidebarOpen ? "20.95rem" : "0rem",
		}),
		[rightSidebarOpen]
	);
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
				<RightSidebar />
			</SidebarProvider>
			<div className="w-full h-full fixed flex flex-row">
				<div className="h-full duration-200 ease-linear" style={leftSidebarStyle} />
				<Main />
				<div className="h-full duration-200 ease-linear" style={rightSidebarStyle} />
			</div>
			{/* <div className="w-full pointer-events-none h-full fixed flex flex-row">
				<div className="h-full duration-200 ease-linear" style={leftSidebarStyle} />
				<AnimatePresence>
					{online&&rightSidebarOpen&&<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.3 }}
					onClick={() => setRightSidebarOpen(false)}
					className="w-full pointer-events-auto h-full bg-background/20 backdrop-blur-[2px]" />}
				</AnimatePresence>
			</div> */}
			<AnimatePresence>{(!initDone || !lang || !game) && <Checklist />}</AnimatePresence>
			<AnimatePresence>{changes.title && <Changes />}</AnimatePresence>
		</div>
	);
}
export default App;
