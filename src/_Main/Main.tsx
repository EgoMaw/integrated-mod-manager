import { AnimatePresence, motion } from "motion/react";
import { useAtomValue } from "jotai";
import { ONLINE } from "@/utils/vars";
import MainLocal from "./MainLocal";
import MainOnline from "./MainOnline";
import BottomBar from "./components/BottomBar";
import TopBar from "./components/TopBar";
import { ONLINE_TRANSITION } from "@/utils/consts";

function Main() {
	const online = useAtomValue(ONLINE);
	return (
		<div className="border-border flex flex-col w-full h-full overflow-hidden duration-200 border">
			<TopBar />
			<div className="flex w-full h-full px-2 overflow-hidden">
				<AnimatePresence mode="popLayout" initial={false}>
					<motion.div
						{...ONLINE_TRANSITION(online)}
						key={online ? "online" : "local"}
						className="flex flex-col delay-200 items-center h-full min-w-full overflow-y-hidden "
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
