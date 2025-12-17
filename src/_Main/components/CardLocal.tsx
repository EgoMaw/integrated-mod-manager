import React from "react";
import { Label } from "@/components/ui/label";
import { getImageUrl, handleImageError, handleInAppLink } from "@/utils/utils";
import { Link2Icon, Link2OffIcon, UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

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
}

const CardLocal = React.memo(({ item, selected, lastUpdated, hasUpdate }: CardLocalProps) => {
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
			<div className="bg-background/50 fadein backdrop-blur
			 flex items-center w-full min-h-14 gap-2 px-4 py-1 header-img">
				{item?.source ? (
					hasUpdate?<Button onClick={()=>{
						handleInAppLink(item.source||"")
					}} className="pointer-events-auto" variant="ghost">
						<UploadIcon  className="text-accent"/>
					</Button>:<Link2Icon className="text-accent"/>
				) : (
					<Link2OffIcon className="text-muted"/>
				)}
				<Label
					className="text-ellipsis w-56 overflow-hidden border-0 pointer-events-none select-none"
					style={{ backgroundColor: "#fff0", filter: item.enabled ? "brightness(1)" : "brightness(0.5) saturate(0.5)" }}
				>
					{item.name}
				</Label>
			</div>
			
		</div>
	);
});

CardLocal.displayName = "CardLocal";

export default CardLocal;
