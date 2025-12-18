import { Button } from "@/components/ui/button";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useAtom, useAtomValue } from "jotai";
import { ArrowLeftIcon, ArrowRightIcon, MinusIcon, RectangleHorizontalIcon, XIcon } from "lucide-react";
import { LEFT_SIDEBAR_OPEN, ONLINE, RIGHT_SIDEBAR_OPEN, RIGHT_SLIDEOVER_OPEN } from "./vars";
import { AnimatePresence, motion } from "motion/react";
import Help from "@/_Main/components/Help";
import Updater from "@/_Main/components/Updater";
const appWindow = getCurrentWindow();

function Decorations() {
	const [leftSidebarOpen, setLeftSidebarOpen] = useAtom(LEFT_SIDEBAR_OPEN);
	const [rightSidebarOpen, setRightSidebarOpen] = useAtom(RIGHT_SIDEBAR_OPEN);
	const [rightSlideOverOpen, setRightSlideOverOpen] = useAtom(RIGHT_SLIDEOVER_OPEN);
	const online = useAtomValue(ONLINE);
	return (
		<div
			data-tauri-drag-region
			className="h-8 select-none w-screen game-font fixed z-1000 top-0 bg-sidebar border-b left-0 right-0 flex items-center"
		>
			<div className="w-full h-full flex items-center pointer-events-none	">
				<div
					className="flex items-center pointer-events-none -mr-2 duration-200 text-xs h-full gap-1"
					style={{
						minWidth: leftSidebarOpen ? "20.75rem" : "3.75rem",
						justifyContent: leftSidebarOpen ? "" : "center",
					}}
				>
					{/* <img src="IMMDecor.png" className="h-full p-2 -mr-2" />
					<label
						className="min-w-42 duration-200 transition-opacity"
						style={{
							minWidth: leftSidebarOpen ? "" : "0px",
							maxWidth: leftSidebarOpen ? "" : "0px",
							opacity: leftSidebarOpen ? "" : "0",
						}}
					>
						{" "}
						• Integrated Mod Manager
					</label> */}
				</div>
				<Button
					onClick={(e) => {
						e.stopPropagation();
						setLeftSidebarOpen((prev: boolean) => !prev);
					}}
					className="flex items-center pointer-events-auto justify-center h-4 w-4 gap-0"
				>
					<ArrowLeftIcon
						className=" pointer-events-none max-h-3.5 duration-200 stroke-1"
						style={{
							width: leftSidebarOpen ? "1.5rem" : "0rem",
						}}
					/>
					<ArrowRightIcon
						className=" pointer-events-none max-h-3.5 duration-200 stroke-1"
						style={{
							width: leftSidebarOpen ? "0rem" : "1.5rem",
						}}
					/>
				</Button>
				<div className="w-full h-full items-center justify-between flex overflow-hidden">
					<div className="min-w-16 h-1"></div>
					<div style={{
						marginLeft: rightSidebarOpen?"":"6.5rem"
					}} className="flex h-full items-center justify-center gap-1">
						<Updater/>
					</div>

					<Help />
				</div>
				<div
					style={{
						minWidth: rightSidebarOpen ? "16.25rem" : "1.5rem",
					}}
					className="flex ml-2 items-center duration-200 justify-start"
				>
					<Button
						onClick={(e) => {
							e.stopPropagation();
							online ? setRightSlideOverOpen((prev: boolean) => !prev) : setRightSidebarOpen((prev: boolean) => !prev);
						}}
						className="flex items-center pointer-events-auto justify-center h-4 w-4 gap-0"
					>
						<ArrowRightIcon
							className=" pointer-events-none max-h-3.5 duration-200 stroke-1"
							style={{
								width: (online ? rightSlideOverOpen : rightSidebarOpen) ? "1.5rem" : "0rem",
							}}
						/>
						<ArrowLeftIcon
							className=" pointer-events-none max-h-3.5 duration-200 stroke-1"
							style={{
								width: (online ? rightSlideOverOpen : rightSidebarOpen) ? "0rem" : "1.5rem",
							}}
						/>
					</Button>
				</div>
			</div>
			<div className="flex gap-1 px-1">
				<Button onClick={() => appWindow.minimize()} variant="warn" className="h-4 w-4">
					<MinusIcon className="max-h-3" />
				</Button>
				<Button onClick={() => appWindow.toggleMaximize()} variant="success" className="h-4 w-4">
					<RectangleHorizontalIcon className="max-h-3 scale-x-80" />
				</Button>
				<Button onClick={() => appWindow.close()} variant="destructive" className="h-4 w-4">
					<XIcon className="max-h-3" />
				</Button>
			</div>
			{/* <div className="titlebar-button" id="titlebar-minimize">
				<img src="https://api.iconify.design/mdi:window-minimize.svg" alt="minimize" />
			</div>
			<div className="titlebar-button" id="titlebar-maximize">
				<img src="https://api.iconify.design/mdi:window-maximize.svg" alt="maximize" />
			</div>
			<div className="titlebar-button" id="titlebar-close">
				<img src="https://api.iconify.design/mdi:close.svg" alt="close" />
			</div> */}
		</div>
	);
}

export default Decorations;
