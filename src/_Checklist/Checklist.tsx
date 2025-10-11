import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import Page1 from "./pages/Page1";

import Page2 from "./pages/Page2";
import Page3 from "./pages/Page3";
import Page4 from "./pages/Page4";
function Checklist() {
	const [page, setPage] = useState(0);
	const pages = [
		<Page1 setPage={setPage} />,
		<Page2 setPage={setPage} />,
		<Page3 setPage={setPage} />,
		<Page4 setPage={setPage} />,
	] as any;
	return (
		<motion.div
			key="intro"
			initial={{ opacity: page !== 0 ? 1 : 0, filter: "blur(6px)", pointerEvents: "none" }}
			animate={{ opacity: 1, filter: "blur(0px)", pointerEvents: "auto" }}
			exit={{ opacity: 0, filter: "blur(6px)", pointerEvents: "none" }}
			className="z-10 bg-background/50 backdrop-blur-md fixed w-screen h-screen"
		>
			{/* <div
				className="bg-bgg  fixed w-screen h-screen"
				style={{
					opacity: 0.1,
					animation: "moveDiagonal 15s linear infinite",
				}}
			/> */}
			<AnimatePresence mode="wait">
				<motion.div
					key={page}
					initial={{ opacity: 0, pointerEvents: "none" }}
					animate={{ opacity: 1, pointerEvents: "auto" }}
					exit={{ opacity: 0, pointerEvents: "none" }}
					transition={{
						duration: 0.3,
						ease: "easeInOut",
					}}
					className="w-full h-full"
				>
					{pages[page]}
				</motion.div>
			</AnimatePresence>
		</motion.div>
	);
}
export default Checklist;
