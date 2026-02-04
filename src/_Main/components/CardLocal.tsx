import React from "react";
import { Label } from "@/components/ui/label";
import { getImageUrl, handleImageError, handleInAppLink } from "@/utils/utils";
import { Link2Icon, Link2OffIcon, SwordsIcon, UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openConflict } from "@/utils/vars";

interface CardLocalProps {
	item: {
		path: string;
		name: string;
		enabled: boolean;
		isDir: boolean;
		source?: string;
	};
	selected: boolean;
	lastUpdated: number;
	hasUpdate: boolean;
	updateAvl: string;
	inConflict: number;
}

const CardLocal = React.memo(({ item, selected, lastUpdated, hasUpdate, updateAvl, inConflict }: CardLocalProps) => {
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
				className="fadein object-cover w-full h-full pointer-events-none"
				src={previewUrl}
				onError={(e) => handleImageError(e, true)}
			/>
			<img
				style={{ filter: item.enabled ? "brightness(1)" : "brightness(0.5) saturate(0.5)" }}
				className="w-full fadein h-[calc(100%-3.5rem)] -mt-[calc(var(--card-height)-2px)]   duration-200 rounded-t-lg data-gi:rounded-none pointer-events-none object-cover"
				src={previewUrl}
				onError={(e) => handleImageError(e)}
			/>

			<div
				className="bg-background/50 rounded-b-xl data-zzz:rounded-bl-3xl fadein backdrop-blur
			 flex items-center w-full min-h-14 gap-2 px-2 py-1 header-img"
			>
				{inConflict >= 0 ? (
					<Button
						onMouseDown={() => {
							openConflict(inConflict);
						}}
						variant="ghost"
					>
						<SwordsIcon className="text-destructive h-4" />
					</Button>
				) : item?.source ? (
					<Link2Icon className="text-accent h-4" />
				) : (
					<Link2OffIcon className="text-muted h-4" />
				)}
				<Label
					className="text-ellipsis w-56 overflow-hidden border-0 text-xs pointer-events-none select-none"
					style={{ backgroundColor: "#fff0", filter: item.enabled ? "brightness(1)" : "brightness(0.5) saturate(0.5)" }}
				>
					{item.name}
				</Label>
			</div>
			{item?.source && hasUpdate && (
				<div
					className="fadein backdrop-blur -mt-[calc(var(--card-height)-2px)]
			 flex items-center w-full h-8 bg-background/50 pointer-events-none duration-200 justify-center border-y header-img"
				>
					{" "}
					<div className="absolute h-full w-full bgx-flash pointer-events-none" />
					<div
						onMouseDown={() => {
							handleInAppLink(item.source || "");
						}}
						className="pointer-events-auto h-8 absolute  textx-flash w-full rounded-none text-xs hover:text-background flex items-center justify-center gap-1 cursor-pointer"
					>
						<UploadIcon className="h-4" /> {updateAvl}
					</div>
				</div>
			)}
		</div>
	);
});

CardLocal.displayName = "CardLocal";

export default CardLocal;
