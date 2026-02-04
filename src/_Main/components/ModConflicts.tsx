import CardLocal from "@/_Main/components/CardLocal";
import { Button } from "@/components/ui/button";
import { DialogContent } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toggleMod } from "@/utils/filesys";
import { preventContextMenu } from "@/utils/utils";

import { CONFLICT_INDEX, CONFLICTS,  MOD_LIST, TEXT_DATA } from "@/utils/vars";

import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {  useState } from "react";

function ModConflicts() {
	const setModList = useSetAtom(MOD_LIST);
	const { conflicts } = useAtomValue(CONFLICTS);
	const [curIndex, setCurIndex] = useAtom(CONFLICT_INDEX);
	const [curSelected, setCurSelected] = useState(-1);
	if (curIndex >= conflicts.length){
		setCurIndex(Math.max(0,conflicts.length-1));
	}
	return (
		<DialogContent>
			<Tooltip>
				<TooltipTrigger></TooltipTrigger>
				<TooltipContent className="opacity-0"></TooltipContent>
			</Tooltip>

			<div className="min-h-fit text-accent mt-6 text-3xl">Resolve Mod Conflicts</div>
			{conflicts.length > 0 ? (
				<div className="max-h-100 min-h-100 flex flex-col w-full h-full p-2 pt-6 overflow-x-hidden overflow-y-scroll text-gray-300 rounded-sm">
					<div className="min-h-fit flex flex-row flex-wrap gap-10 justify-center w-full py-4">
						{conflicts[curIndex]?.map((path, idx) => (
							<div
								onMouseUp={(e) => {
									e.preventDefault();
									setCurSelected((prev) => (prev === idx ? -1 : idx));
								}}
								onContextMenu={preventContextMenu}
							>
								<CardLocal
									item={{
										path,
										name: path.split("\\").pop() || path,
										enabled: curSelected === -1 ? true : curSelected === idx,
										isDir: false,
									}}
									selected={curSelected === idx}
									lastUpdated={0}
									hasUpdate={false}
									updateAvl={""}
									key={idx}
									inConflict={0}
								/>
							</div>
						))}
					</div>
				</div>
			) : (
				<div className="text-center w-full h-100 justify-center items-center flex text-gray-400">No Conflicts Detected</div>
			)}

			<div
				className="flex w-full justify-between"
				style={{
					opacity: conflicts.length > 0 ? "1" : "0",
					pointerEvents: conflicts.length > 0 ? "auto" : "none",
				}}
			>
				<Button
					disabled={curIndex <= 0}
					onClick={() => {
						if (curIndex > 0) {
							let newIndex = curIndex - 1;
							setCurIndex(newIndex);
							// setCurKey(conflicts[newIndex][0]);
							setCurSelected(-1);
						}
					}}
					className="min-w-24"
				>
					Prev
				</Button>
				<div className="flex flex-row text-accent gap-1 text-sm items-center justify-center px-10 w-full">
					{/* <Input
					value={curIndex+1}
					className="text-center px-1 min-w-8"
					style={{
						background:"none",
						width:((curIndex+1).toString().length+0.5) + "rem",
					}}
					onChange={(e)=>{
						let val = parseInt(e.target.value);
						if(!isNaN(val)&&val>0&&val<=conflicts.length && val!==curIndex+1){
							let newIndex = val - 1;
							setCurIndex(newIndex);
							setCurKey(conflicts[newIndex][0]);
							setCurSelected(-1);
						}
					}}
					/> / {conflicts.length} */}
					{conflicts?.map((c, i) => (
						<div
							key={c[0]}
							className={`w-3 h-3 rounded-full cursor-pointer duration-200 ${
								i === curIndex ? "bg-accent" : "border hover:bg-muted"
							}`}
							onClick={() => {
								setCurIndex(i);
								// setCurKey(conflicts[i][0]);
								setCurSelected(-1);
							}}
						></div>
					))}
				</div>
				<Button
					disabled={curIndex >= conflicts.length - 1 && curSelected === -1}
					onClick={async () => {
						let toDisable: any =
							curSelected < 0 ? [] : [...conflicts[curIndex]].filter((_, idx) => idx !== curSelected);
						
						if (toDisable.length > 0) {
							const promises = toDisable.map((path: string) => toggleMod(path, false));
							await Promise.all(promises);
							toDisable = new Set(toDisable);
							setCurSelected(-1);
							setModList((old) =>
								old.map((mod) => ({
									...mod,
									enabled: toDisable.has(mod.path) ? false : mod.enabled,
								}))
							);
						}
						else if (curIndex < conflicts.length - 1) {
							let newIndex = curIndex + 1;
							setCurIndex(newIndex);
							setCurSelected(-1);
						}
					}}
					className="min-w-24"
				>
					{curSelected >= 0 ? "Resolve" : "Skip"}
				</Button>
			</div>
		</DialogContent>
	);
}

export default ModConflicts;
