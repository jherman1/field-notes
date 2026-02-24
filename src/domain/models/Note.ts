
export type Note = {
    id: string;
    title: string;
    body: string;
    tags: string[];
    pinned: boolean;
    createdAt: number;
    updatedAt: number;
};

export function makeEmptyNote(id: string, now = Date.now()): Note {
    return {
        id,
        title: "",
        body: "",
        tags: [],
        pinned: false,
        createdAt: now,
        updatedAt: now,
    };
}