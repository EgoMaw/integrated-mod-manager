import React from "react";
import { Label } from "@/components/ui/label";
// import { renameMod } from "@/utils/fsUtils";
// import { setChange } from "@/utils/hotreload";
// import { previewUri } from "@/utils/vars";
import { File, Folder, XIcon } from "lucide-react";
import { getImageUrl, handleImageError } from "@/utils/utils";
import { Button } from "@/components/ui/button";
// import { CSS_CLASSES, COMMON_STYLES } from "@/utils/consts";
// import type { CardLocalProps } from "@/utils/types";

interface CardLocalProps {
	item: {
		path: string;
		name: string;
		enabled: boolean;
		isDir: boolean;
	};
	selected: boolean;
	lastUpdated: number;
}

const CardLocal = React.memo(({ item, selected, lastUpdated }: CardLocalProps) => {
	const previewUrl = `${getImageUrl(item.path)}?${lastUpdated}`;

	return (
		<div
			className={`card-generic ${selected ? "selected-card" : ""}`}
			style={{
				borderColor: item.enabled ? "var(--accent)" : "",
			}}
		>
			<img
				style={{ filter: item.enabled ? "brightness(1) blur(8px) " : " blur(8px) brightness(0.5) saturate(0.5)" }}
				className="object-cover fadein w-full h-full pointer-events-none"
				src={previewUrl}
				onError={(e) => handleImageError(e, true)}
			/>
			<img
				style={{ filter: item.enabled ? "brightness(1)" : "brightness(0.5) saturate(0.5)" }}
				className="w-full fadein h-[calc(100%-3.5rem)] -mt-71.5 duration-200 rounded-t-lg pointer-events-none object-cover"
				src={previewUrl}
				onError={(e) => handleImageError(e)}
			/>
			<div className="bg-background/50 fadein backdrop-blur flex items-center w-full min-h-14 gap-2 px-4 py-1">
				{item.isDir ? (
					<Folder style={{ filter: item.enabled ? "brightness(1)" : "brightness(0.5) saturate(0.5)" }} />
				) : (
					<File style={{ filter: item.enabled ? "brightness(1)" : "brightness(0.5) saturate(0.5)" }} />
				)}
				<Label
					className="w-56 pointer-events-none select-none overflow-hidden border-0 text-ellipsis"
					style={{ backgroundColor: "#fff0", filter: item.enabled ? "brightness(1)" : "brightness(0.5) saturate(0.5)" }}
				>
					{item.name}
				</Label>
				<Button className="-mt-123 bg-button/0 data-zzz:border-0 cursor-pointer flex text-red-300 items-center justify-center  px-2 w-8 h-6 z-200 -ml-5 -mr-5">
					<XIcon className="pointer-events-none" />
				</Button>
			</div>
		</div>
	);
});

CardLocal.displayName = "CardLocal";

export default CardLocal;
