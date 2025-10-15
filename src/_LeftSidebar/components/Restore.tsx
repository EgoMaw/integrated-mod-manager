import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { TEXT_DATA } from "@/utils/vars";
import { useAtomValue } from "jotai";
import { SaveAllIcon } from "lucide-react";
import { useState } from "react";
function Restore({ leftSidebarOpen }: any) {
    const textData = useAtomValue(TEXT_DATA);
    const [dialogOpen, setDialogOpen] = useState(false);
	return (
		<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
			<DialogTrigger asChild>
				<Button className="w-38.75 data-[theme=zzz]:bg-red-300 text-ellipsis h-12 overflow-hidden" style={{ width: leftSidebarOpen ? "" : "3rem" }}>
					<SaveAllIcon />
					{leftSidebarOpen && textData._LeftSideBar._components._Restore.Restore}
				</Button>
			</DialogTrigger>
			<DialogContent></DialogContent>
		</Dialog>
	);
}

export default Restore;
