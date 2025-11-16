import { store, TOASTS } from "@/utils/vars";
import { useAtomValue } from "jotai";
import { AnimatePresence, motion } from "motion/react";
// import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
let counter = 0;
export function addToast({
	id = Date.now(),
	type = "info",
	message,
	duration = 3000,
}: {
	id?: number;
	type?: "success" | "error" | "info" | "warning";
	message: string;
	duration?: number;
}) {
	const toast = { id, type, message, duration };
	counter++;
	setTimeout(() => {
		store.set(TOASTS, (prevToasts) => prevToasts.filter((t) => t.id !== toast.id));
	}, duration);
	store.set(TOASTS, (prevToasts) => [...prevToasts, toast].slice(-3));
}
function ToastProvider() {
	const toasts = useAtomValue(TOASTS);
	// const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

	// // Mouse tracking
	// useEffect(() => {
	// 	const handleMouseMove = (event: MouseEvent) => {
	// 		setMousePosition({ x: event.clientX, y: event.clientY });
	// 	};
	// 	window.addEventListener("mousemove", handleMouseMove);
	// 	window.addEventListener("scroll", ()=>{//console.log("Scrolling")});
	// 	return () => window.removeEventListener("mousemove", handleMouseMove);
	// }, []);
	return createPortal(
		<>
		<div className="fixed z-[99999] top-1 left-1/2 -translate-x-1/2 w-82 h-2 flex flex-col-reverse items-center justify-center pointer-events-none">
			<AnimatePresence>
				{toasts.map((toast: any, index: number) => (
					<motion.div
					key={toast.id}
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -20 }}
					transition={{ duration: 0.3 }}
					layout
					style={{
						zIndex: 99999 - counter + index,
						scale: 0.9 + (index - toasts.length) * 0.1,
						color:
							toast.type === "success"
								? "var(--success)"
								: toast.type === "error"
								? "var(--destructive)"
								: toast.type === "warning"
								? "var(--warn)"
								: ""
					}}
					className="w-full game-font text-center h-20 polka min-h-20 -mb-22 bg-card pointer-events-none flex items-center justify-center rounded-md button-like border"
					>
						{toast.message}
					</motion.div>
				))}
			</AnimatePresence>
			{/* Custom Cursor */}
			</div>
			{/* <div
				className="cursor z-[9999999] fixed top-0 left-0 min-w-8 min-h-8 pointer-events-none"
				style={{
					left: `${mousePosition.x}px`,
					top: `${mousePosition.y}px`,
				}}
				/> */}
				</>,
		document.body
	);
}

export default ToastProvider;
