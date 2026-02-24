

import AsyncStorage from "@react-native-async-storage/async-storage";
import { nanoid } from "nanoid/non-secure";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { Note, makeEmptyNote } from "../domain/models/Note";

type NoteState = {
    notesById: Record<string, Note>;
    noteIds: string[];

    query: string;
    tagFilter: string | null;

    createNote: () => string; //returns new noteId
    upsertNote: (note: Note) => void;
    deleteNote: (id: string) => void;

    setQuery: (q: string) => void;
    setTagFilter: (tag: string | null) => void;

    getNote: (id: string) => Note | undefined;
    getVisibleNotes: () => Note[];
    getAllTags: () => string[];
};

function normalizeText(s: string) {
    return s.trim().toLowerCase();
}

export const useNotesStore = create<NoteState>() (
    persist(
        (set, get) => ({
            notesById: {},
            noteIds: [],

            query: "",
            tagFilter: null,

            createNote: () => {
                const id = nanoid();
                const note = makeEmptyNote(id);
                set((state) => ({
                    notesById: { ...state.notesById, [id] : note },
                    noteIds: [id, ...state.noteIds],
                }));
                return id;
            },
            
            upsertNote: (note) => {
                set((state) => {
                    const exists = Boolean(state.notesById[note.id]);
                    const nextIds = exists ? state.noteIds : [note.id, ...state.noteIds];

                    return {
                        notesById: { ...state.notesById, [note.id]: note},
                        noteIds: nextIds,
                    };
                });
            },

            deleteNote: (id) => {
                set((state) => {
                    const { [id]: _, ...rest } = state.notesById;
                    return {
                        notesById: rest, 
                        noteIds: state.noteIds.filter((x) => x !== id),
                    }
                });
            },

            setQuery: (q) => set({ query: q }),
            setTagFilter: (tag) => set({ tagFilter: tag }),

            getNote: (id) => get().notesById[id],

            getVisibleNotes: () => {
                const { notesById, noteIds, query, tagFilter } = get();
                const q = normalizeText(query);

                const all = noteIds.map((id) => notesById[id]).filter(Boolean) as Note[];

                all.sort((a, b) => {
                    if(a.pinned !== b.pinned) return a.pinned ? -1 : 1;
                    return b.updatedAt - a.updatedAt;
                });

                return all.filter((n) => {
                    const matchesTag = tagFilter ? n.tags.includes(tagFilter) : true;
                    if (!matchesTag) return false;

                    if (!q) return true;

                    const hay = normalizeText(`${n.title} ${n.body} ${n.tags.join(" ")}`);
                    return hay.includes(q);
                });
            },

            getAllTags: () => {
                const { notesById } = get();
                const setTags = new Set<string>();
                Object.values(notesById).forEach((n) => n.tags.forEach((t) => setTags.add(t)));
                return Array.from(setTags).sort((a, b) => a.localeCompare(b));
            },


        }),
        {
            name: "field-notes-v1",
            storage: createJSONStorage(() => AsyncStorage),
            version: 1,
            partialize: (state) => ({
                notesById: state.notesById,
                noteIds: state.noteIds,
            }),
        }
    )

);