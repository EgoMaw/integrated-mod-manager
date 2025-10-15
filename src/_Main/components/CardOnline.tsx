import React from "react";
import { Label } from "@/components/ui/label";
// import { renameMod } from "@/utils/fsUtils";
// import { setChange } from "@/utils/hotreload";
// import { previewUri } from "@/utils/vars";
import { EyeOffIcon, File, Folder, LoaderIcon, MessageSquareIcon, PlusIcon, ThumbsUpIcon, XIcon } from "lucide-react";
import { getImageUrl, getTimeDifference, handleImageError } from "@/utils/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const Online = React.memo((data: any) => {
	const backgroundImage = data._aPreviewMedia?._aImages?.[0]
		? `${data._aPreviewMedia._aImages[0]._sBaseUrl}/${data._aPreviewMedia._aImages[0]._sFile}`
		: "/err";

	return (
		<div
			className="card-generic card-online "
		>
			<img
				className="flex fadein flex-col bg-no-repeat items-center justify-center w-full h-full duration-200 bg-center object-cover rounded-t-lg pointer-events-none"
				src={backgroundImage}
				onError={(e) => handleImageError(e)}
				style={{
					filter:
						data._sInitialVisibility === "hide" && data.blur === true ? "brightness(0.5) blur(4px)" : "brightness(1)",
				}}
			/>
			{data._sInitialVisibility === "hide" && data.blur === true && (
				<div className="max-h-0 fadein mb-45 z-20  -mt-45 w-fit self-center">
					<Button
						className=" bg-background/50 duration-200 pointer-events-auto"
						onClick={(e) => {
							e.currentTarget.style.opacity = "0";
							e.currentTarget.style.pointerEvents = "none";
							let parent = e.currentTarget.parentElement?.previousSibling as HTMLElement;
							if (parent) {
								parent.style.filter = "brightness(1)";
							}
						}}
					>
						<EyeOffIcon /> {data.show}
					</Button>
				</div>
			)}
			<div
				className={`w-fit fadein bg-background/50 text-accent  backdrop-blur -mt-72 flex flex-col items-center px-4 py-1 mb-48 rounded-br-lg pointer-events-none`}
			>
				{data._sModelName}
			</div>

			<div className={`bg-background/50 fadein backdrop-blur flex flex-col items-center w-full px-4 py-1`}>
				<Input
					readOnly
					type="text"
					className="bg-semi w-56 cursor-pointer select-none focus-within:select-auto overflow-hidden h-8 focus-visible:ring-[0px] border-0 text-ellipsis"
					// style={COMMON_STYLES.TRANSPARENT_BG}
					defaultValue={data._sName}
				/>
				<div className="flex justify-between w-full h-6 text-xs">
					<label className="flex items-center justify-center">
						<PlusIcon className="h-4" />
						{getTimeDifference(data.now, data._tsDateAdded || 0)}
					</label>
					<label className="flex items-center justify-center">
						<LoaderIcon className="h-4" />
						{getTimeDifference(data.now, data._tsDateModified || 0)}
					</label>
					<label className="flex items-center justify-center">
						<ThumbsUpIcon className="h-4" />
						{data._nLikeCount || "0"}
					</label>
					<label className="flex items-center justify-center">
						<MessageSquareIcon className="h-4" />
						{data._nPostCount || "0"}
					</label>
				</div>
			</div>
		</div>
	);
});

Online.displayName = "CardOnline";

export default Online;
