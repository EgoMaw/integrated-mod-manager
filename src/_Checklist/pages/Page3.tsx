import { verifyDirStruct } from "@/utils/filesys";
import { CHANGES, SETTINGS, SOURCE, TARGET, TEXT_DATA } from "@/utils/vars";
import { invoke } from "@tauri-apps/api/core";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";

function Page3({ setPage }: { setPage: (page: number) => void }) {
	const [tgt, setTgt] = useAtom(TARGET);
	const [src, setSrc] = useAtom(SOURCE);
	const [user, setUser] = useState("User");
	const textData = useAtomValue(TEXT_DATA);
	const setChanges = useSetAtom(CHANGES);
	useEffect(() => {
		async function skip() {
			// setTgt(tgt);
			// setSrc(src);
			setChanges((await verifyDirStruct()) as any);
			setPage(4);
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
				setPage(3);
			}}
		>
			<div className="fixed z-20 flex flex-col items-center justify-center w-full h-full duration-200">
				<div className="text-accent text-5xl">
					{textData._Intro._Intro.Greeting} <label id="user">{user}</label>
				</div>
				<div className="text-accent/75 my-2 text-2xl">{textData._Intro._Intro.Configure}</div>
				<div className=" mt-5 opacity-50">{textData._Intro._Intro.Continue}</div>
			</div>
		</div>
	);
}
export default Page3;
