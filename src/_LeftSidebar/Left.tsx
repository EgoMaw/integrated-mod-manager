import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";


import { Globe, HardDriveDownload } from "lucide-react";
import { Separator } from "@/components/ui/separator";

import { Button } from "@/components/ui/button";
import { useAtom, useAtomValue} from "jotai";
import { LEFT_SIDEBAR_OPEN, ONLINE, TEXT_DATA } from "@/utils/vars";
import { AnimatePresence, motion } from "motion/react";
import LeftOnline from "./LeftOnline";
import LeftLocal from "./LeftLocal";
import Restore from "./components/Restore";
import Settings from "./components/Settings";
function LeftSidebar() {
	
	const leftSidebarOpen = useAtomValue(LEFT_SIDEBAR_OPEN);
	const textData = useAtomValue(TEXT_DATA);
	const [online, setOnline] = useAtom(ONLINE)
	return (
		<Sidebar collapsible="icon">
			<SidebarContent className="bg-sidebar gap-0 overflow-hidden border border-r-0">
				<div className="min-h-16 min-w-16 flex items-center justify-center h-16 gap-5 p-0 border-b">
					<div
						id="WWM MLogo"
						className="aspect-square logo h-10"
						onClick={() => {
							// setTutorialMode(true);
						}}
						></div>
					<div
						className="flex flex-col w-24 text-center duration-200 ease-linear"
						style={{
							marginRight: leftSidebarOpen ? "" : "-7.125rem",
							opacity: leftSidebarOpen ? "" : "0",
						}}>
						<label className="text-2xl text-[#eaeaea] min-w-fit font-bold">WuWa</label>
						<label className="min-w-fit text-accent/75 text-sm">Mod Manager</label>
					</div>
				</div>
				<SidebarGroup
					className="duration-200 px-0  mt-2.5"
					style={{
						minHeight: leftSidebarOpen ? "4.5rem" : "5.5rem",
					}}>
					<SidebarGroupLabel>{textData._LeftSideBar._Left.Mode}</SidebarGroupLabel>
					<div
						className="min-h-fit flex flex-row items-center justify-between w-full gap-2 px-2 overflow-hidden"
						style={{
							flexDirection: leftSidebarOpen ? "row" : "column",
						}}>
						<Button
							onClick={() => {
								setOnline(false);
							}}
							className={"w-38.75 overflow-hidden text-ellipsis " + (!online && "hover:brightness-125 bg-accent text-background")}
							style={{ width: leftSidebarOpen ? "" : "2.5rem" }}>
							<HardDriveDownload className="w-6 h-6" />
							{leftSidebarOpen && textData.generic.Installed}
						</Button>
						<Button
							onClick={() => {
								setOnline(true);
							}}
							className={"w-38.75 overflow-hidden text-ellipsis " + (online && "hover:brightness-125 bg-accent text-background")}
							style={{ width: leftSidebarOpen ? "" : "2.5rem" }}>
							<Globe className="w-6 h-6" />
							{leftSidebarOpen && textData._LeftSideBar._Left.Online}
						</Button>
					</div>
				</SidebarGroup>
				<Separator
					className="w-full ease-linear duration-200 min-h-[1px] my-2.5 bg-border"
					style={{
						opacity: leftSidebarOpen ? "0" : "",
						height: leftSidebarOpen ? "0px" : "",
						marginBlock: leftSidebarOpen ? "4px" : "",
					}}
				/>
				<SidebarGroup className="flex flex-row w-full h-full p-0 overflow-hidden">
					<AnimatePresence mode="wait" initial={false}>
					<motion.div
						initial={{ opacity: 0, x: online ? "25%" : "-25%" }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: online ? "25%" : "-25%" }}
						transition={{ duration: 0.2 }}
						key={online ? "online" : "local"}
						className="flex flex-col h-full min-w-full duration-300 "
					>
						{online ? <LeftOnline /> : <LeftLocal />}
					</motion.div>
				</AnimatePresence>
				</SidebarGroup>
				<Separator
					className="w-full ease-linear duration-200 min-h-[1px] mt-2.5 bg-border"
					style={{
						opacity: leftSidebarOpen ? "0" : "",
						height: leftSidebarOpen ? "0px" : "",
						marginTop: leftSidebarOpen ? "4px" : "",
					}}
				/>
				<SidebarFooter
					className="flex items-center justify-center w-full overflow-hidden duration-200"
					style={{
						flexDirection: leftSidebarOpen ? "row" : "column",
						minHeight: leftSidebarOpen ? "5rem" : "8.5rem",
					}}>
					<Restore leftSidebarOpen={leftSidebarOpen} />
					<Settings leftSidebarOpen={leftSidebarOpen} />
				</SidebarFooter>
			</SidebarContent>
		</Sidebar>
	);
}
export default LeftSidebar;
