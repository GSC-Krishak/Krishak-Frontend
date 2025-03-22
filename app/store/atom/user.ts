import { atom } from "recoil";

export const userAtom = atom<{
    Loading: boolean,
    user?: {
        email: string;
    }
}>({
    key: "userAtom",
    default: {
        Loading: true,
    }
})