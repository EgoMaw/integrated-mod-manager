import { addToast } from "@/_Toaster/ToastProvider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { managedSRC, managedTGT } from "@/utils/consts";
import { applyPreset, folderSelector, verifyDirStruct } from "@/utils/filesys";
import { getDataDir, readXXMIConfig, verifyGameDir } from "@/utils/init";
import { join } from "@/utils/utils";
import { CHANGES, GAME, SOURCE, TARGET, TEXT_DATA, XXMI_DIR, XXMI_MODE } from "@/utils/vars";
import { exists } from "@tauri-apps/plugin-fs";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { FolderCog2Icon, InfoIcon } from "lucide-react";
import { useState } from "react";

function Page4({ setPage }: { setPage: (page: number) => void }) {
	const [tgt, setTgt] = useState(getDataDir());
	const [src, setSrc] = useState(tgt);
	const [checked, setChecked] = useAtom(XXMI_MODE);
	const [checked2, setChecked2] = useState(true);
	const setSource = useSetAtom(SOURCE);
	const [xxmiDir, setXxmiDir] = useAtom(XXMI_DIR);
	const setTarget = useSetAtom(TARGET);
	const textData = useAtomValue(TEXT_DATA);
	const game = useAtomValue(GAME);
	const setChanges = useSetAtom(CHANGES);
	return (
		<div className="text-muted-foreground fixed flex flex-col items-center justify-center w-screen h-screen">
			<div className="fixed z-20 flex flex-col items-center justify-center w-full duration-200">
				{
					<div className="text-accent flex flex-col items-center gap-5 my-2 text-2xl">
						Confirm {!checked ? "XXMI Launcher Directory" : "Custom Directories"}
						<div
							className="flex items-center gap-2"
							style={{
								opacity: checked ? 0 : 1,
								height: checked ? "0px" : "40px",
								transition: "all 0.3s ease-in-out",
								pointerEvents: checked ? "none" : "auto",
								marginTop: checked ? "-10px" : 0,
								marginBottom: checked ? "-10px" : 0,
							}}
						>
							<Button
								className="aspect-square items-center justify-center "
								onClick={async () => {
									let path = ((await folderSelector(tgt)) as string) || tgt || "";
									path =
										path.endsWith("MI") && path.split("\\").pop() === `${game}MI`
											? path.split("\\").slice(0, -1).join("\\")
											: path;
									setXxmiDir(path);
								}}
							>
								<FolderCog2Icon className="inline w-4 h-4" />
							</Button>
							<Input
								type="text"
								onFocus={(e) => {
									e.currentTarget.blur();
								}}
								className="w-108 border-border/0 bg-input/50 text-accent/75 text-ellipsis h-10 overflow-hidden text-center cursor-default"
								value={xxmiDir?.replace("/", "\\") ?? "-"}
							/>
						</div>
						<div className=" flex min-w-fit  items-center gap-2">
							<Checkbox
								checked={!checked}
								onClick={() => setChecked(checked ? 0 : 1)}
								className=" checked:bg-accent bgaccent  "
							/>
							<label className="text-accent/75 text-sm min-w-fit">I'm using XXMI Launcher</label>
						</div>
						<div
							className="flex overflow-y-hidden items-center gap-2"
							style={{
								opacity: !checked ? 0 : 1,
								height: !checked ? "0px" : "40px",
								transition: "all 0.3s ease-in-out",
								pointerEvents: !checked ? "none" : "auto",
								marginTop: !checked ? "-10px" : 0,
								marginBottom: !checked ? "-10px" : 0,
							}}
						>
							<Label className="flex items-center gap-1">
								<Tooltip>
									<TooltipTrigger>
										<InfoIcon className="inline w-4 h-4  opacity-50 hover:opacity-100" />
									</TooltipTrigger>
									<TooltipContent>
										<p className="w-48 text-center">
											This directory is where the program you are using to inject mods expects the mod files to be in.
										</p>
									</TooltipContent>
								</Tooltip>
								Target Dir :
							</Label>
							<Input
								type="text"
								className="w-96 border-border/0 bg-input/50 text-accent/75 text-ellipsis h-10 overflow-hidden text-center cursor-default"
								value={tgt?.replace("/", "\\") ?? "-"}
							/>
							<Button
								className="w-32"
								onClick={async () => {
									let path = ((await folderSelector(tgt)) as string) || tgt || "";
									path = path.endsWith(managedSRC)
										? path.split(managedSRC)[0]
										: path.endsWith(managedTGT)
										? path.split(managedTGT)[0]
										: path;
									path = !path.endsWith("Mods")
										? (await exists(join(path, "Mods")))
											? join(path, "Mods")
											: path
										: path;
									setTgt(path);
									if (checked2) {
										setSrc(path);
									}
								}}
							>
								{textData.Browse}
							</Button>
						</div>
						<div
							className="flex overflow-y-hidden items-center gap-2"
							style={{
								opacity: !checked || checked2 ? 0 : 1,
								height: !checked || checked2 ? "0px" : "40px",
								transition: "all 0.3s ease-in-out",
								pointerEvents: !checked || checked2 ? "none" : "auto",
								marginTop: !checked || checked2 ? "-10px" : 0,
								marginBottom: !checked || checked2 ? "-10px" : 0,
							}}
						>
							<Label className="flex items-center gap-1">
								<Tooltip>
									<TooltipTrigger>
										<InfoIcon className="inline w-4 h-4  opacity-50 hover:opacity-100" />
									</TooltipTrigger>
									<TooltipContent>
										<p className="w-48 text-center">
											This directory is where you have stored your mod files. When you enable a mod in IMM, it will
											create a symlink from this directory to the Target Directory.
										</p>
									</TooltipContent>
								</Tooltip>
								Source Dir :
							</Label>
							<Input
								type="text"
								className="w-96 border-border/0 bg-input/50 text-accent/75 text-ellipsis h-10 overflow-hidden text-center cursor-default"
								value={src?.replace("/", "\\") ?? "-"}
							/>
							<Button
								className="w-32"
								onClick={async () => {
									if (checked2) return;
									let path = ((await folderSelector(src)) as string) || src || "";
									path = path.endsWith(managedSRC)
										? path.split(managedSRC)[0]
										: path.endsWith(managedTGT)
										? path.split(managedTGT)[0]
										: path;
									path = !path.endsWith("Mods")
										? (await exists(join(path, "Mods")))
											? join(path, "Mods")
											: path
										: path;
									setSrc(path);
								}}
							>
								{textData.Browse}
							</Button>
						</div>
						<div
							className=" flex min-w-fit  items-center gap-2"
							style={{
								opacity: !checked ? 0 : 1,
								height: !checked ? "0px" : "40px",
								transition: "all 0.3s ease-in-out",
								pointerEvents: !checked ? "none" : "auto",
								marginTop: !checked ? "-10px" : 0,
								marginBottom: !checked ? "-10px" : 0,
							}}
						>
							<Checkbox
								checked={checked2}
								onClick={() => setChecked2(!checked2)}
								className=" checked:bg-accent bgaccent  "
							/>
							<label className="text-accent/75 text-sm min-w-fit">
								Mods are stored in the same directory as Target
							</label>
						</div>
						<Button
							className={"w-32 mt-2"}
							onClick={async () => {
								if (checked) {
									setTarget(tgt);
									setSource(checked2 ? tgt : src);
								} else {
									await readXXMIConfig(xxmiDir);
									const dirs = await verifyGameDir(game);
									console.log(dirs);
									if (!dirs.sourceDir || !dirs.targetDir) {
										addToast({
											message: "Could Not Verify XXMI Config",
											type: "error",
										});
										return;
									}
									// initGame(game);
									setSource(dirs.sourceDir);
									setTarget(dirs.targetDir);
								}
								applyPreset([]);
								setChanges(await verifyDirStruct());
								setPage(4);
								// setTarget(tgt);
								// setSource(
								// 	checked
								// 		? tgt
								// 		: src.endsWith(managedSRC)
								// 		? src.split(managedSRC)[0]
								// 		: src.endsWith(managedTGT)
								// 		? src.split(managedTGT)[0]
								// 		: src
								// );
								// applyPreset([]);
								// setChanges(await verifyDirStruct());
								// setPage(4);
							}}
						>
							{textData.Confirm}
						</Button>
					</div>
				}
			</div>
		</div>
	);
}
export default Page4;
