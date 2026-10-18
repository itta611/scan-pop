import { atom } from "jotai/vanilla";
import { atomWithStorage } from "jotai/vanilla/utils";
import {
	defaultScreen,
	type SavedScreen,
	type ScreenConfig,
	screenSchema,
} from "./schema";

type Draft = { config: ScreenConfig; saved?: SavedScreen };

const draftAtom = atomWithStorage<Draft>(
	"qrpop.editor",
	{ config: defaultScreen },
	undefined,
	{ getOnInit: true },
);

export const savingScreenAtom = atom(false);
export const screenConfigAtom = atom((get) => get(draftAtom).config);
export const savedScreenAtom = atom((get) => get(draftAtom).saved);

function settingAtom<Key extends keyof ScreenConfig>(key: Key) {
	return atom(
		(get) => get(screenConfigAtom)[key],
		(_get, set, value: ScreenConfig[Key]) => {
			set(draftAtom, (draft) => ({
				...draft,
				config: { ...draft.config, [key]: value },
			}));
		},
	);
}

export const urlAtom = settingAtom("url");
export const titleAtom = settingAtom("title");
export const messageAtom = settingAtom("message");
export const themeAtom = settingAtom("theme");
export const confettiAtom = settingAtom("confetti");
export const amountAtom = settingAtom("amount");

export const hasDestinationAtom = atom((get) => Boolean(get(urlAtom).trim()));
export const saveScreenAtom = atom(null, async (get, set) => {
	const config = get(screenConfigAtom);
	const parsed = screenSchema.parse(config);
	const saved = get(savedScreenAtom);
	set(savingScreenAtom, true);
	try {
		const response = await fetch(
			saved ? `/api/screens/${saved.id}` : "/api/screens",
			{
				method: saved ? "PUT" : "POST",
				headers: {
					"Content-Type": "application/json",
					...(saved ? { "X-Edit-Token": saved.editToken } : {}),
				},
				body: JSON.stringify(parsed),
			},
		);
		const data = await response.json();
		if (!response.ok) throw new Error(data.error);
		const screen = data as SavedScreen;
		set(draftAtom, (current) => ({
			config: current.config === config ? parsed : current.config,
			saved: screen,
		}));
		return screen;
	} finally {
		set(savingScreenAtom, false);
	}
});
