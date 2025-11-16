import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { verifyDirStruct } from "@/utils/filesys";
import { CHANGES, GAME, SOURCE, TARGET, TEXT_DATA, XXMI_DIR, XXMI_MODE } from "@/utils/vars";

import { invoke } from "@tauri-apps/api/core";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { ArrowUpRightFromSquareIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";

function Page3({ setPage }: { setPage: (page: number) => void }) {
	const tgt = useAtomValue(TARGET);
	const src = useAtomValue(SOURCE);
	const [game,setGame] = useAtom(GAME);
	const xxmiDir = useAtomValue(XXMI_DIR);
	const customMode = useAtomValue(XXMI_MODE);
	const [user, setUser] = useState("User");
	const textData = useAtomValue(TEXT_DATA);
	const setChanges = useSetAtom(CHANGES);
	//console.log(src,tgt)
	useEffect(() => {
		async function skip() {
			// setTgt(tgt);
			// setSrc(src);
			setPage(4);
			setChanges(await verifyDirStruct());
		}
		if (src && tgt) {
			skip();
		} else {
			invoke("get_username").then((name) => {
				if (name) setUser(name as string);
			});
		}
	}, [src, tgt]);
	return (
		<div
			className="text-muted-foreground fixed flex flex-col items-center justify-center w-screen h-screen"
			onClick={() => {
				//
			}}
		>
			<div className="fixed z-20 flex flex-col items-center justify-center w-full h-full duration-200">
				{xxmiDir && !customMode ? (
					<>
						<div className="text-accent my-4 text-2xl">XXMI Configuration Error</div>
						<p className="text-foreground w-108 text-center opacity-75 text-lg">
							Either {game}MI is not installed, or it has an invalid configuration in XXMI.
						</p>
						<div className="flex w-128 justify-between items-center">
							<Button
								className={"w-32 scale-110 my-6"}
								onClick={async () => {
									setGame("");
									setPage(1);
								}}
							>
								Switch Game
							</Button>
							<Button
								className={"w-32 scale-110 my-6"}
								onClick={async () => {
									setPage(3);
								}}
							>
								Configure 
							</Button>
						</div>
					</>
				) : (
					<>
						<div className="text-accent text-5xl">
							{textData._Checklist.Greeting} <label id="user">{user}</label>
						</div>
						<div className="text-foreground opacity-75 mt-4 text-2xl">IMM was built with XXMI in mind.</div>
						<div className="text-foreground opacity-75 text-lg">For the best experience, please install XXMI.</div>
						<Button
							className={"w-32 scale-110 my-6"}
							onClick={async () => {
								setPage(3);
							}}
						>
							Continue
						</Button>

						<AlertDialog>
							<AlertDialogTrigger>
								<a
									className=" opacity-50 hover:opacity-100 duration-200"
									href="https://github.com/SpectrumQT/XXMI-Launcher"
									target="_blank"
								>
									What is XXMI?
								</a>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogCancel
									className="absolute top-3 text-destructive right-3 opacity-75 hover:opacity-100"
									variant="hidden"
								>
									<XIcon />
								</AlertDialogCancel>
								<div className="flex text-foreground/75 items-center flex-col gap-4 p-4">
									<h2 className="text-2xl text-accent font-bold">XXMI Launcher</h2>

									<p className=" text-center">
										Install and open{" "}
										<a
											className=" opacity-75 hover:opacity-100 duration-200"
											href="https://github.com/SpectrumQT/XXMI-Launcher"
											target="_blank"
										>
											XXMI Launcher <ArrowUpRightFromSquareIcon className="inline w-4 h-4 mb-1" />
										</a>{" "}
										, download respective modules (WWMI, ZZMI, GIMI, etc...).
									</p>
									<label>Once complete, press the reload button below.</label>
									<Button
										className="w-32 mt-2"
										onClick={async () => {
											window.location.reload();
										}}
									>
										Reload
									</Button>
								</div>
							</AlertDialogContent>
						</AlertDialog>
					</>
				)}
				{/* <div className="w-108 flex justify-between items-center h-10"></div> */}
			</div>
			{game == "WW" && (
				<div className="fixed z-30 opacity-70 flex flex-col items-center bottom-5 text-sm ">
					<label>{textData._Checklist.AutoMigration}</label>
					<label>{textData._Checklist.MigrationFailed}</label>
					<label>{textData._Checklist.AfterVerify}</label>
				</div>
			)}
		</div>
	);
}
export default Page3;
