import { GAME } from "@/utils/vars";
import { useAtomValue } from "jotai";

function Page5() {
	const game = useAtomValue(GAME);
	return (
		<div className="gap-2 fixed flex flex-col items-center justify-center w-screen h-screen">
			<div className="logo min-h-40 aspect-square"></div>
			<div className="text-accent textaccent opacity-50 flex text-2xl">{{ WW: "WuWa", ZZ: "ZZZ" }[game] || "Integrated"} Mod Manager</div>
		</div>
	);
}
export default Page5;
