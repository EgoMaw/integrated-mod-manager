import { IMAGER_SERVER, managedSRC } from "./consts";
import { GAME, LAST_UPDATED, SOURCE, store } from "./vars";
export function join(...parts: string[]) {
	let result = parts.join("\\").replace("/", "\\").replaceAll("\\\\", "\\");
	result = result.endsWith("\\") ? result.slice(0, -1) : result;
	result = result.startsWith("\\") ? result.slice(1) : result;
	return result;
}
export function handleImageError(event: React.SyntheticEvent<HTMLImageElement, Event>, hideOnError = false): void {
	const target = event.currentTarget;
	if (hideOnError) {
		target.style.opacity = "0";
	}
	target.src = `/${store.get(GAME)}mm.png`;
}
export function preventContextMenu(event: React.MouseEvent): void {
	event.preventDefault();
}
let src = "";
let lastUpdated = 0;
store.sub(LAST_UPDATED, () => {
	lastUpdated = Date.now();	
});
store.sub(SOURCE, () => {
	src = store.get(SOURCE);
});
export function getImageUrl(path: string): string {
	return `${IMAGER_SERVER}/${src}/${managedSRC}/${path}`;
}
const PRIORITY_KEYS = ["Alt", "Ctrl", "Shift", "Capslock", "Tab", "Up", "Down", "Left", "Right"];
const PRIORITY_SET = new Set(PRIORITY_KEYS);
export function keySort(keys: string[]): string[] {
	
	const regularKeys = keys.filter((key) => !PRIORITY_SET.has(key));
	
	regularKeys.sort((a, b) => {
		
		if (a.length !== b.length) {
			return a.length - b.length;
		}
		
		return a.localeCompare(b);
	});
	
	
	const inputKeysSet = new Set(keys);
	const presentPriorityKeys = PRIORITY_KEYS.filter((pKey) => inputKeysSet.has(pKey));
	
	return [...presentPriorityKeys, ...regularKeys];
}
export function getTimeDifference(startTimestamp: number, endTimestamp: number) {
	const secInMinute = 60;
	const secInHour = secInMinute * 60;
	const secInDay = secInHour * 24;
	const secInYear = secInDay * 365;
	const diff = Math.abs(endTimestamp - startTimestamp);
	if (diff < secInMinute) {
		return "now";
	} else if (diff < secInHour) {
		const minutes = Math.floor(diff / secInMinute);
		return minutes + "m";
	} else if (diff < secInDay) {
		const hours = Math.floor(diff / secInHour);
		return hours + "h";
	} else if (diff < secInYear) {
		const days = Math.floor(diff / secInDay);
		return days + "d";
	} else {
		const years = Math.floor(diff / secInYear);
		return years + "y";
	}
}