import { TEXT } from "./text";
export const IMAGER_SERVER = "http://127.0.0.1:5000/preview";
export const OLD_RESTORE = "DISABLED_RESTORE";
export const RESTORE = "RESTORE";
export const IGNORE = "IGNORE";
export const UNCATEGORIZED = "Uncategorized";
export const managedSRC = "DISABLED (Managed by IMM)";
export const managedTGT = "Mods (Managed by IMM)";
export const VERSION="2.1.0"
export const GAMES = ["WW","ZZ"]
export const LANG_LIST = [
	{
		Name: TEXT.en.generic.Current,
		Flag: TEXT.en.generic.Flag,
		Code: "en",
	},
	{
		Name: TEXT.cn.generic.Current,
		Flag: TEXT.cn.generic.Flag,
		Code: "cn",
	},
	{
		Name: TEXT.ru.generic.Current,
		Flag: TEXT.ru.generic.Flag,
		Code: "ru",
	},
	{
		Name: TEXT.jp.generic.Current,
		Flag: TEXT.jp.generic.Flag,
		Code: "jp",
	},
	{
		Name: TEXT.kr.generic.Current,
		Flag: TEXT.kr.generic.Flag,
		Code: "kr",
	},
];