import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { LANG_LIST } from "@/utils/consts";
import { saveConfigs, selectPath } from "@/utils/filesys";
import { setWindowType } from "@/utils/init";
import { TEXT } from "@/utils/text";
import { keySort } from "@/utils/utils";
import { PRESETS, SETTINGS, TEXT_DATA } from "@/utils/vars";
import { Separator } from "@radix-ui/react-separator";
import { useAtom, useAtomValue } from "jotai";
import {
	AppWindowIcon,
	CheckIcon,
	CircleSlashIcon,
	DownloadIcon,
	EyeClosedIcon,
	EyeIcon,
	EyeOffIcon,
	FocusIcon,
	FolderIcon,
	Globe2,
	InfoIcon,
	Maximize2Icon,
	MaximizeIcon,
	MouseIcon,
	MousePointerClickIcon,
	PauseIcon,
	PlayIcon,
	SettingsIcon,
	SquareIcon,
	UploadIcon,
	XIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
let bg: HTMLBodyElement | null = null;
let keys= [] as any[]
let keysdown = [] as any[]
function Settings({ leftSidebarOpen }: any) {
	const textData = useAtomValue(TEXT_DATA);
    const [presets,setPresets] = useAtom(PRESETS);
	const [settings, setSettings] = useAtom(SETTINGS);
	const [alertOpen, setAlertOpen] = useState(false);
	const [globalPage, setGlobalPage] = useState(true);
	const [langAlertData, setLangAlertData] = useState({ prev: "en", new: "en" } as {
		prev: keyof typeof TEXT;
		new: keyof typeof TEXT;
	});
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					onClick={() => {
						// setProgress &&
						// 	setProgress((prev: number[]) => {
						// 		prev[1] = 1;
						// 		return [...prev];
						// 	});
					}}
					className="w-38 text-ellipsis h-12 overflow-hidden"
					style={{ width: leftSidebarOpen ? "" : "3rem" }}
				>
					<SettingsIcon />
					{leftSidebarOpen && textData.generic.Settings}
				</Button>
			</DialogTrigger>
			<DialogContent className="min-w-180 scale-95 game-font min-h-125 bg-background/50 border-border gap -4 flex flex-col items-center p-4 overflow-hidden border-2 rounded-lg">
				<AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
					<AlertDialogContent className="min-w-120 game-font bg-background/50 backdrop-blur-xs border-border flex flex-col items-center gap-4 p-4 overflow-hidden border-2 rounded-lg">
						<div className=" flex flex-col items-center gap-6 mt-6 text-center">
							<div className="text-xl flex gap-2 flex-col items-center justify-center text-gray-200">
								{TEXT[langAlertData.prev].generic.Change +
									TEXT[langAlertData.prev].generic.Languages[langAlertData.new]}
								?
								<Separator />
								{TEXT[langAlertData.new].generic.Change + TEXT[langAlertData.new].generic.Languages[langAlertData.new]}?
							</div>

							{langAlertData.new !== "en" && (
								<div className="max-w-96 text-accent gap-4 text-sm flex flex-col	">
									<span>
										{TEXT[langAlertData.prev].generic.Warning1 + " "}
										{TEXT[langAlertData.prev].generic.Warning2}
									</span>
									<span>
										{TEXT[langAlertData.new].generic.Warning1 + " "}
										{TEXT[langAlertData.new].generic.Warning2}
									</span>
								</div>
							)}
						</div>
						<div className="flex justify-between w-full gap-4 mt-4">
							<AlertDialogCancel className="min-w-24 duration-300">
								{TEXT[langAlertData.prev].generic.Cancel} | {TEXT[langAlertData.new].generic.Cancel}
							</AlertDialogCancel>
							<AlertDialogAction
								className="min-w-24 text-accent hover:bg-accent hover:text-background"
								onClick={() => {
									setSettings((prev) => {
										prev.global.lang = langAlertData.new;
										return { ...prev };
									});
									saveConfigs();
									setAlertOpen(false);
								}}
							>
								{TEXT[langAlertData.prev].generic.Confirm} | {TEXT[langAlertData.new].generic.Confirm}
							</AlertDialogAction>
						</div>
					</AlertDialogContent>
				</AlertDialog>
				<div className="min-h-fit text-accent my-6 text-3xl">
					{textData.generic.Settings}
					<Tooltip>
						<TooltipTrigger></TooltipTrigger>
						<TooltipContent className="opacity-0"></TooltipContent>
					</Tooltip>
				</div>
				<Tabs
					defaultValue={globalPage ? "global" : "game"}
					onValueChange={(val) => setGlobalPage(val === "global")}
					className="w-full"
				>
					<TabsList className="bg-background/50 w-full gap-2">
						<TabsTrigger value="global" className="w-1/2 h-10">
							<Globe2 />
							Global
						</TabsTrigger>
						<TabsTrigger value="game" className="w-1/2 h-10">
							<div className="height-2 aspect-square logo min-h-4"></div>
							{{ WW: "WuWa", ZZ: "ZZZ" }[settings.global.game]}
						</TabsTrigger>
					</TabsList>
					<AnimatePresence mode="wait" initial={false}>
						<motion.div
							key={globalPage ? "global" : "game"}
							initial={{ opacity: 0, x: globalPage ? "-25%" : "25%" }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: globalPage ? "-25%" : "25%" }}
							transition={{ duration: 0.2 }}
							className="w-full gap-2 flex min-h-80"
						>
							{globalPage ? (
								<>
									<div className="min-w-1/2 justify-evenly flex flex-col min-h-full gap-4 pr-2">
										<div className="flex flex-col w-full gap-4">
											<label className="min-w-fit">{textData._LeftSideBar._components._Settings.Toggle}</label>
											<Tabs
												defaultValue={settings.global.toggleClick.toString()}
												className="w-full"
												onValueChange={(e) => {
													setSettings((prev) => {
														prev.global.toggleClick = parseInt(e) as 0 | 2;
														return { ...prev };
													});
													saveConfigs();
												}}
											>
												<TabsList className="bg-background/50 w-full">
													<TabsTrigger value="0" className="w-1/2 h-10">
														<MousePointerClickIcon className=" rotate-y-180 w-4 -mr-2" />
														<MouseIcon />
														{textData._LeftSideBar._components._Settings._Toggle.LeftClick}
													</TabsTrigger>
													<TabsTrigger value="2" className="w-1/2 h-10">
														<MouseIcon />
														<MousePointerClickIcon className=" w-4 -ml-2" />
														{textData._LeftSideBar._components._Settings._Toggle.RightClick}
													</TabsTrigger>
												</TabsList>
											</Tabs>
										</div>
										<div className="flex flex-col w-full gap-4">
											<label>{textData._LeftSideBar._components._Settings.WindowType}</label>
											<Tabs
												defaultValue={settings.global.winType.toString()}
												onValueChange={(e) => {
													setSettings((prev) => {
														prev.global.winType = parseInt(e) as 0 | 1 | 2;
														return { ...prev };
													});
													setWindowType(parseInt(e));
													saveConfigs();
												}}
												className="w-full"
											>
												<TabsList className="bg-background/50 w-full">
													<TabsTrigger value="0" className="w-1/3 h-10">
														<AppWindowIcon className="aspect-square h-full pointer-events-none" />{" "}
														{textData._LeftSideBar._components._Settings._WindowType.Windowed}
													</TabsTrigger>
													<TabsTrigger value="1" className="w-1/3 h-10">
														<MaximizeIcon className="aspect-square h-full pointer-events-none" />{" "}
														{textData._LeftSideBar._components._Settings._WindowType.Borderless}
													</TabsTrigger>
													<TabsTrigger value="2" className="w-1/3 h-10">
														<Maximize2Icon className="aspect-square h-full pointer-events-none" />{" "}
														{textData._LeftSideBar._components._Settings._WindowType.Fullscreen}
													</TabsTrigger>
												</TabsList>
											</Tabs>
										</div>
										<div className="flex flex-col w-full gap-4">
											<label className="min-w-fit">{textData._LeftSideBar._components._Settings.WindowBGOpacity}</label>

											<Slider
												defaultValue={[settings.global.bgOpacity * 100]}
												max={100}
												min={0}
												step={1}
												className="w-full m-1"
												onValueChange={(e) => {
													bg = bg || document.querySelector("body");
													if (bg)
														bg.style.backgroundColor = "color-mix(in oklab, var(--background) " + e + "%, transparent)";
												}}
												onValueCommit={(e) => {
													setSettings((prev) => {
														prev.global.bgOpacity = e[0] / 100;
														return { ...prev };
													});
													saveConfigs();
												}}
											/>
										</div>
									</div>
									<div className="min-w-1/2 justify-evenly flex flex-col min-h-full gap-4 pr-4">
										<div className="flex flex-col w-full gap-4">
											<div className="flex items-center gap-1">
												{textData._LeftSideBar._components._Settings.NSFW}
												<Tooltip>
													<TooltipTrigger>
														<InfoIcon className="text-muted-foreground hover:text-gray-300 w-4 h-4" />
													</TooltipTrigger>
													<TooltipContent>
														<div className="flex flex-col gap-1">
															<div>
																<b>{textData._LeftSideBar._components._Settings._NSFW.Remove} -</b>{" "}
																{textData._LeftSideBar._components._Settings._NSFW.RemoveMsg}
															</div>
															<div>
																<b>{textData._LeftSideBar._components._Settings._NSFW.Blur} -</b>{" "}
																{textData._LeftSideBar._components._Settings._NSFW.BlurMsg}
															</div>
															<div>
																<b>{textData._LeftSideBar._components._Settings._NSFW.Show} -</b>{" "}
																{textData._LeftSideBar._components._Settings._NSFW.ShowMsg}
															</div>
														</div>
													</TooltipContent>
												</Tooltip>
											</div>
											<Tabs
												defaultValue={settings.global.nsfw.toString()}
												onValueChange={(e) => {
													setSettings((prev) => {
														prev.global.nsfw = parseInt(e) as 0 | 1 | 2;
														return { ...prev };
													});
													saveConfigs();
												}}
												className="w-full"
											>
												<TabsList className="bg-background/50 w-full">
													<TabsTrigger value="0" className="w-1/3 h-10">
														<EyeOffIcon className="aspect-square h-full pointer-events-none" />{" "}
														{textData._LeftSideBar._components._Settings._NSFW.Remove}
													</TabsTrigger>
													<TabsTrigger value="1" className="w-1/3 h-10">
														<EyeClosedIcon className="aspect-square h-full pointer-events-none" />{" "}
														{textData._LeftSideBar._components._Settings._NSFW.Blur}
													</TabsTrigger>
													<TabsTrigger value="2" className="w-1/3 h-10">
														<EyeIcon className="aspect-square h-full pointer-events-none" />{" "}
														{textData._LeftSideBar._components._Settings._NSFW.Show}
													</TabsTrigger>
												</TabsList>
											</Tabs>
										</div>
										<div className="flex flex-col w-full gap-4">
											<label>{textData._LeftSideBar._components._Settings.BgType}</label>
											<Tabs
												defaultValue={settings.global.bgType.toString()}
												onValueChange={(e) => {
													setSettings((prev) => {
														prev.global.bgType = parseInt(e) as 0 | 1 | 2;
														return { ...prev };
													});
													saveConfigs();
												}}
												className="w-full"
											>
												<TabsList className="bg-background/50 w-full">
													<TabsTrigger value="0" className="w-1/3 h-10">
														<SquareIcon className="aspect-square h-full pointer-events-none" />{" "}
														{textData._LeftSideBar._components._Settings._BgType.Blank}
													</TabsTrigger>
													<TabsTrigger value="1" className="w-1/3 h-10">
														<PauseIcon className="aspect-square h-full pointer-events-none" />{" "}
														{textData._LeftSideBar._components._Settings._BgType.Static}
													</TabsTrigger>
													<TabsTrigger value="2" className="w-1/3 h-10">
														<PlayIcon className="aspect-square h-full pointer-events-none" />
														{textData._LeftSideBar._components._Settings._BgType.Dynamic}
													</TabsTrigger>
												</TabsList>
											</Tabs>
										</div>
										<div className="flex flex-col w-full gap-4">
											<label>{textData.generic.Language}</label>
											<div className="flex justify-evenly ">
												{LANG_LIST.map((lang) => (
													<div
														key={lang.Code}
														className={`hover:brightness-150 -mt-2 flex-col flex items-center justify-center gap-1 text-sm duration-300 cursor-pointer select-none`}
														onClick={() => {
															if (settings.global.lang == lang.Code) return;
															setLangAlertData({
																prev: (settings.global.lang as keyof typeof TEXT) || "en",
																new: lang.Code as keyof typeof TEXT,
															});
															setAlertOpen(true);
														}}
													>
														<img src={lang.Flag} alt={lang.Name} className="w-6 h-6 duration-200 hover:scale-120" />
														<span
															className="overflow-hidden duration-200 mt-12 text-accent absolute whitespace-nowrap "
															style={{
																opacity: settings.global.lang == lang.Code ? "1" : "0",
															}}
														>
															{lang.Name}
														</span>
													</div>
												))}
											</div>
										</div>
									</div>
								</>
							) : (
								<>
									<div className="min-w-1/2 justify-between flex flex-col min-h-full gap-4 pr-4">
										<div className="flex flex-col w-full gap-4">
											<div className="flex items-center gap-1">
												{textData._LeftSideBar._components._Settings.AutoReload}
												<Tooltip>
													<TooltipTrigger>
														<InfoIcon className="text-muted-foreground hover:text-gray-300 w-4 h-4" />
													</TooltipTrigger>
													<TooltipContent>
														<div className="flex flex-col gap-1">
															<div>
																<b>{textData._LeftSideBar._components._Settings._AutoReload.Disable} -</b>{" "}
																{textData._LeftSideBar._components._Settings._AutoReload.DisableMsg}
															</div>
															<div>
																<b>WWMM -</b> {textData._LeftSideBar._components._Settings._AutoReload.WWMMMsg}
															</div>
															<div>
																<b>{textData._LeftSideBar._components._Settings._AutoReload.OnFocus} -</b>{" "}
																{textData._LeftSideBar._components._Settings._AutoReload.FocusMsg}
															</div>
															<Separator />
															<div>{textData._LeftSideBar._components._Settings._AutoReload.ReloadMsg}</div>
														</div>
													</TooltipContent>
												</Tooltip>
											</div>
											<Tabs
												defaultValue={settings.game.hotReload.toString()}
												className="w-full"
												onValueChange={(e: any) => {
													e = parseInt(e) as 0 | 1 | 2;
													setSettings((prev) => {
														prev.game.hotReload = e;
														return { ...prev };
													});
													// setHotreload(e);
													saveConfigs();
												}}
											>
												<TabsList className="bg-background/50 w-full">
													<TabsTrigger value="0" className="w-1/3 h-10">
														<CircleSlashIcon />
														{textData._LeftSideBar._components._Settings._AutoReload.Disable}
													</TabsTrigger>
													<TabsTrigger value="1" className="w-1/3 h-10">
														<AppWindowIcon />
														WWMM
													</TabsTrigger>
													<TabsTrigger value="2" className="w-1/3 h-10">
														<FocusIcon />
														{textData._LeftSideBar._components._Settings._AutoReload.OnFocus}
													</TabsTrigger>
												</TabsList>
											</Tabs>
										</div>
										<div className="flex flex-col w-full gap-4">
											<div className="flex items-center gap-1">
												{textData._LeftSideBar._components._Settings.LaunchGame}
												<Tooltip>
													<TooltipTrigger>
														<InfoIcon className="text-muted-foreground hover:text-gray-300 w-4 h-4" />
													</TooltipTrigger>
													<TooltipContent>
														<div className="flex flex-col items-center gap-1">
															<div>{textData._LeftSideBar._components._Settings._LaunchGame.LaunchMsg1}</div>
															<div>{textData._LeftSideBar._components._Settings._LaunchGame.LaunchMsg2}</div>
														</div>
													</TooltipContent>
												</Tooltip>
											</div>
											<Tabs
												defaultValue={settings.game.launch.toString()}
												className="w-full"
												onValueChange={(e) => {
													setSettings((prev) => {
														prev.game.launch = parseInt(e) as 0 | 1;
														return { ...prev };
													});
													saveConfigs();
												}}
											>
												<TabsList className="bg-background/50 w-full">
													<TabsTrigger value="0" className="w-1/2 h-10">
														<XIcon className=" rotate-y-180 w-4" />
														{textData._LeftSideBar._components._Settings._AutoReload.Disable}
													</TabsTrigger>
													<TabsTrigger value="1" className="w-1/2 h-10">
														<CheckIcon className=" w-4" />{" "}
														{textData._LeftSideBar._components._Settings._AutoReload.Enable}
													</TabsTrigger>
												</TabsList>
											</Tabs>
											<div className="flex flex-row items-center w-full gap-2">
												<Button
													disabled={settings.game.launch == 0}
													className="aspect-square flex items-center justify-center w-8 h-8"
													onClick={async () => {
														const path = await selectPath();
														if (path) {
															// setSettings((prev) => {
															// 	prev.appDir = path;
															// 	return { ...prev };
															// });
															// saveConfig();
														}
													}}
													style={{
														marginLeft: leftSidebarOpen ? "" : "0.25rem",
													}}
												>
													<FolderIcon className="aspect-square w-5" />
												</Button>
												<Input
													readOnly
													disabled={settings.game.launch == 0}
													type="text"
													className="w-72 overflow-hidden border-border/0 bg-input/50 cursor-default duration-200 text-ellipsis h-8"
													value={settings.global.exeXXMI ?? "-"}
													style={{
														width: leftSidebarOpen ? "" : "0px",
														opacity: leftSidebarOpen ? "" : "0",
													}}
												/>
											</div>
										</div>
										<div className="flex flex-col w-full gap-4">
											{textData._LeftSideBar._components._Settings.ImportExport}
											<div className="flex justify-start w-full gap-2 pr-2">
												<Button
													// disabled={disabled}
													// onClick={importConfig}
													className="h-9 bg-input/30 hover:border-input border-input/0 text-muted-foreground hover:text-gray-300 w-1/2 text-sm border"
												>
													<DownloadIcon className="w-4 h-4" />
													{textData._LeftSideBar._components._Settings._ImportExport.Import}
												</Button>
												<Button
													// onClick={exportConfig}
													className="h-9 bg-input/30 hover:border-input border-input/0 text-muted-foreground hover:text-gray-300 w-1/2 text-sm border"
												>
													<UploadIcon className="w-4 h-4" />
													{textData._LeftSideBar._components._Settings._ImportExport.Export}
												</Button>
											</div>
										</div>
									</div>
									<div className="min-w-1/2 justify-e venly flex flex-col min-h-full gap-2 pr-4">
											<div className="flex items-center gap-1">
												{textData._LeftSideBar._components._Settings.HotKey}
												<Tooltip>
													<TooltipTrigger>
														<InfoIcon className="text-muted-foreground hover:text-gray-300 w-4 h-4" />
													</TooltipTrigger>
													<TooltipContent>
														<div className="flex flex-col gap-1">
															<div>{textData._LeftSideBar._components._Settings._HotKey.HKMsg1}</div>
															<div>
																{textData._LeftSideBar._components._Settings._HotKey.HKMsg2} <b>'WWMM'</b>{" "}
																{textData._LeftSideBar._components._Settings._HotKey.HKMsg3}{" "}
																<b>'{textData._LeftSideBar._components._Settings._AutoReload.OnFocus}'</b>
															</div>
															<Separator />
															<div>{textData._LeftSideBar._components._Settings._HotKey.HKMsg4}</div>
															<div>
																{textData._LeftSideBar._components._Settings._HotKey.HKMsg5} <b>Ctrl+C</b>,{" "}
																<b>Alt+Tab</b>, {textData._LeftSideBar._components._Settings._HotKey.HKMsg6}
															</div>
															<Separator />
															<div>
																<b>Backspace -</b> {textData._LeftSideBar._components._Settings._HotKey.ClearHK}{" "}
															</div>
														</div>
													</TooltipContent>
												</Tooltip>
											</div>
											<div className="max-h-72 flex flex-col w-full h-full gap-1 p-2 ml-2 overflow-x-hidden overflow-y-auto ">
												{presets.length > 0 ? (
													presets.map((preset, index) => (
														<div className="flex items-center justify-between w-full h-10 gap-2">
															<Input
																className="w-25 text-ellipsis h-10 p-0 overflow-hidden break-words border-0"
																style={{ backgroundColor: "#0000" }}
																onFocus={(e) => {
																	e.currentTarget.blur();
																}}
																value={preset.name}
															></Input>
															<Input
																defaultValue={preset.hotkey
																	.replaceAll("+", "xx+xx")
																	.replaceAll("comma", ",")
																	.replaceAll("space", "Space")
																	.replaceAll("plus", "+")
																	.replaceAll("minus", "-")
																	.replaceAll("multiply", "*")
																	.replaceAll("divide", "/")
																	.replaceAll("decimal", ".")
																	.replaceAll("enter", "↵")
																	.replaceAll("backquote", "`")
																	.replaceAll("backslash", "\\")
																	.replaceAll("bracketleft", "[")
																	.replaceAll("bracketright", "]")
																	.replaceAll("semicolon", ";")
																	.replaceAll("quote", "'")
																	.replaceAll("period", ".")
																	.replaceAll("slash", "/")
																	.replaceAll("equal", "=")
																	.replaceAll("xx+xx", " ﹢ ")}
																autoFocus={false}
																contentEditable={false}
																onKeyDownCapture={(e) => {
																	e.preventDefault();
																	if (e.code == "Backspace") {
																		e.currentTarget.value = "";
																		saveConfigs();
																	} else if (e.code == "Escape") {
																		e.currentTarget.value = preset.hotkey
																			.replaceAll("+", "xx+xx")
																			.replaceAll("comma", ",")
																			.replaceAll("space", "Space")
																			.replaceAll("plus", "+")
																			.replaceAll("minus", "-")
																			.replaceAll("multiply", "*")
																			.replaceAll("divide", "/")
																			.replaceAll("decimal", ".")
																			.replaceAll("enter", "↵")
																			.replaceAll("backquote", "`")
																			.replaceAll("backslash", "\\")
																			.replaceAll("bracketleft", "[")
																			.replaceAll("bracketright", "]")
																			.replaceAll("semicolon", ";")
																			.replaceAll("quote", "'")
																			.replaceAll("period", ".")
																			.replaceAll("slash", "/")
																			.replaceAll("equal", "=")
																			.replaceAll("xx+xx", " ﹢ ");
																		keysdown = [];
																		keys = [];
																	} else {
																		let next: any = [];
																		let key = e.code
																			.toLowerCase()
																			.replaceAll("key", "")
																			.replaceAll("digit", "")
																			.replaceAll("numpad", "")
																			.replaceAll("plus", "+")
																			.replaceAll("minus", "-")
																			.replaceAll("multiply", "*")
																			.replaceAll("divide", "/")
																			.replaceAll("decimal", ".")
																			.replaceAll("enter", "↵")
																			.replaceAll("altright", "Alt")
																			.replaceAll("controlright", "Ctrl")
																			.replaceAll("shiftright", "Shift")
																			.replaceAll("altleft", "Alt")
																			.replaceAll("controlleft", "Ctrl")
																			.replaceAll("shiftleft", "Shift")
																			.replaceAll("arrow", "")
																			.replaceAll("backquote", "`")
																			.replaceAll("backslash", "\\")
																			.replaceAll("bracketleft", "[")
																			.replaceAll("bracketright", "]")
																			.replaceAll("semicolon", ";")
																			.replaceAll("quote", "'")
																			.replaceAll("comma", ",")
																			.replaceAll("period", ".")
																			.replaceAll("slash", "/")
																			.replaceAll("equal", "=")
																			.replaceAll("minus", "-")
																			.replace(/^f(\d+)$/, "F$1")
																			.split("")
																			.map((x, i) => (i == 0 ? x.toUpperCase() : x))
																			.join("");
																		if (keys.includes(key)) {
																			next = keys;
																		} else {
																			if (!keysdown.includes(e.code)) {
																				keysdown.push(e.code);
																			}
																			keys.push(key);
																			next = keySort(keys);
																		}
																		e.currentTarget.value = next.join(" ﹢ ");
																	}
																}}
																onKeyUpCapture={(e) => {
																	if (e.code == "Backspace" || e.code == "Escape") return;
																	let key = e.code;
																	let index = keysdown.indexOf(key);
																	if (index > -1) keysdown.splice(index, 1);
																	if (keysdown.length == 0) {
																		keys = [];
																		e.currentTarget.blur();
																	}
																}}
																onBlur={(e) => {
																	keysdown = [];
																	keys = [];
																	setPresets((prev) => {
																		prev[index].hotkey = e.currentTarget.value
																			.replaceAll(" ﹢ ", "xxplusxx")
																			.replaceAll(",", "comma")
																			.replaceAll("Space", "space")
																			.replaceAll("+", "plus")
																			.replaceAll("-", "minus")
																			.replaceAll("*", "multiply")
																			.replaceAll("/", "divide")
																			.replaceAll(".", "decimal")
																			.replaceAll("↵", "enter")
																			.replaceAll("`", "backquote")
																			.replaceAll("\\", "backslash")
																			.replaceAll("[", "bracketleft")
																			.replaceAll("]", "bracketright")
																			.replaceAll(";", "semicolon")
																			.replaceAll("'", "quote")
																			.replaceAll("=", "equal")
																			.replaceAll("xxplusxx", "+");
																		return [...prev];
																	});
																	saveConfigs();
																	// registerGlobalHotkeys();
																}}
																className=" caret-transparent w-full text-center select-none"
																type="text"
															/>
														</div>
													))
												) : (
													<div className="text-white/50 flex items-center justify-center w-full h-full">
														{textData._LeftSideBar._components._Settings._HotKey.HKEmpty}
													</div>
												)}
										</div>
									</div>
								</>
							)}
						</motion.div>
					</AnimatePresence>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}

export default Settings;
