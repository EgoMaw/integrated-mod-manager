import { AnimatePresence, motion } from "motion/react";
import { useAtomValue } from "jotai";
import { ONLINE } from "@/utils/vars";
import MainLocal from "./MainLocal";
import MainOnline from "./MainOnline";
import BottomBar from "./components/BottomBar";
import TopBar from "./components/Topbar";

function Main() {
	const online = useAtomValue(ONLINE);
	return (
		<div className="border-border flex flex-col w-full h-full overflow-hidden duration-200 border">
			<TopBar />
			<div className="flex w-full h-full px-2 overflow-hidden">
				<AnimatePresence mode="wait" initial={false}>
					<motion.div
						initial={{ opacity: 0, x: online ? "25%" : "-25%" }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: online ? "25%" : "-25%" }}
						transition={{ duration: 0.2 }}
						key={online ? "online" : "local"}
						className="flex flex-col items-center h-full min-w-full overflow-y-hidden "
					>
						{online ? <MainOnline /> : <MainLocal />}
					</motion.div>
				</AnimatePresence>
			</div>
			<BottomBar />
		</div>
	);
}

export default Main;
