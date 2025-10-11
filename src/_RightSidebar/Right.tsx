import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { AnimatePresence, motion } from "motion/react";
import RightOnline from "./RightOnline";
import { useAtomValue } from "jotai";
import { ONLINE, RIGHT_SIDEBAR_OPEN } from "@/utils/vars";
import RightLocal from "./RightLocal";
// import RightOnline from "@/App/RightSideBar/RightOnline";
// import RightLocal from "@/App/RightSideBar/RightLocal";
function RightSidebar() {
	const online = useAtomValue(ONLINE);
	// const rightSidebarOpen = useAtomValue(RIGHT_SIDEBAR_OPEN)
	return (
		<Sidebar side="right" 
		className="bg-sidebar"
		// style={{
		// 	width: online && rightSidebarOpen ? "calc(max(33%, 25rem))" : "",
		// 	backdropFilter: online ? "blur(8px)" : "",
		// 	backgroundColor: online ? "color-mix(in oklab, var(--sidebar) 75%, transparent)" : "",
		// }}
		>
			<SidebarContent className="flex flex-row w-full h-full gap-0 p-0 overflow-hidden border border-l-0">
				<AnimatePresence mode="wait" initial={false}>
					<motion.div
						initial={{ opacity: 0, x: online ? "25%" : "25%" }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: online ? "25%" : "25%" }}
						transition={{ duration: 0.2 }}
						key={online ? "online" : "local"}
						className="flex flex-col items-center h-full min-w-full overflow-y-hidden "
					>
						{online ? <RightOnline /> : <RightLocal />}
					</motion.div>
				</AnimatePresence>
			</SidebarContent>
		</Sidebar>
	);
}
export default RightSidebar;
