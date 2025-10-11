import { GAME, SETTINGS, TEXT_DATA } from "@/utils/vars";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";

function Page2({ setPage }: { setPage: (page: number) => void }) {
	const text = useAtomValue(TEXT_DATA);
	const game = useAtomValue(GAME);
	const setSettings = useSetAtom(SETTINGS);
	useEffect(() => {
		if (game) setPage(2);
	}, [game]);
	return (
		<div className="text-muted-foreground gap-4 fixed flex flex-col items-center justify-center w-screen h-screen">
			<div className="mb-4 text-3xl">
				{text.generic.Select.split("").map((letter, index) => (
					<span
						key={index}
						className="wave-letter"
						style={{
							animationDelay: `${index * 0.1}s`,
						}}
					>
						{letter === " " ? "\u00A0" : letter}
					</span>
				))}
			</div>
			<div className="flex gap-16 select-none items-center justify-center">
				<div
					onClick={() => setSettings((prev) => ({ ...prev, global: { ...prev.global, game: "WW" } }))}
					className="flex duration-200 border border-wuwa-accent/50 hover:shadow-lg hover:-mt-2 active:scale-90 shadow-wuwa-accent hover:bg-wuwa-accent/10 bg-wuwa-accent/2  p-6 rounded-md aspect-square flex-col items-center wuwa-font"
				>
					<img src="/logoWW.png" className="max-h-40 " />
					<label className="text-2xl mt-8">WuWa</label>
				</div>
				<div
					onClick={() => setSettings((prev) => ({ ...prev, global: { ...prev.global, game: "ZZ" } }))}
					className="flex duration-200 border border-zzz-accent/50 hover:shadow-lg hover:-mt-2 active:scale-90 shadow-zzz-accent hover:bg-zzz-accent/10 bg-zzz-accent/2 p-6 rounded-md min-w-56 flex-col items-center zzz-font"
				>
					<img src="/logoZZ.png" className="max-h-40 " />
					<label className="text-2xl mt-8">ZZZ</label>
				</div>
			</div>
		</div>
	);
}
export default Page2;
