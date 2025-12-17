import ReactDOM from "react-dom/client";
import { store } from "./utils/vars";
import { ThemeProvider } from "./components/theme-provide";
import { Provider } from "jotai";
import App from "./App";
import ErrorBoundary from "./utils/errorCatcher";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { addToast } from "./_Toaster/ToastProvider";
import Decorations from "./utils/decorations";
/*
import ErrorBoundary from "./ErrorBoundary";

<ErrorBoundary>
	<App />
</ErrorBoundary>
*/
const capturedLogs: any[] = [];
const originalLog = console.log;
const originalWarn = console.warn;
const originalError = console.error;
function initLogCapture() {
	console.log = function (...args) {
		capturedLogs.push(
			`[LOG] ${new Date().toISOString()}: ${args.map((a) => (typeof a === "object" ? JSON.stringify(a) : a)).join(" ")}`
		);
		originalLog.apply(console, args);
	};

	console.warn = function (...args) {
		capturedLogs.push(
			`[WARN] ${new Date().toISOString()}: ${args
				.map((a) => (typeof a === "object" ? JSON.stringify(a) : a))
				.join(" ")}`
		);
		originalWarn.apply(console, args);
	};

	console.error = function (...args) {
		capturedLogs.push(
			`[ERROR] ${new Date().toISOString()}: ${args
				.map((a) => (typeof a === "object" ? JSON.stringify(a) : a))
				.join(" ")}`
		);
		originalError.apply(console, args);
	};
}

// Function 2: Download captured logs as a .log file
export async function downloadLogs() {
	const filePath = await save({
		title: "Save logs as:",
		defaultPath: `IMM_${Date.now()}.log`,
		filters: [
			{
				name: "Log files",
				extensions: ["log"],
			},
		],
	});
	if (filePath) {
		await writeTextFile(filePath, capturedLogs.join("\n"));
		addToast({ type: "success", message: "Logs exported successfully." });
	}
}

window.addEventListener("keydown", (e) => {
	if (e.key === "F8") {
		e.preventDefault();
		downloadLogs();
	}
});
// Initialize immediately
initLogCapture();
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<Provider store={store}>
		<ThemeProvider defaultTheme="dark">
			<ErrorBoundary>
				<Decorations />
				<App />
			</ErrorBoundary>
		</ThemeProvider>
	</Provider>
);
