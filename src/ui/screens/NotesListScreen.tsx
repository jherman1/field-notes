import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useShallow } from "zustand/react/shallow";
import { useNotesStore } from "../../state/notesStore";
import NoteRow from "../components/NoteRow";
import SearchBar from "../components/SearchBar";
import TagChips from "../components/TagChips";

function normalizeText(s: string) {
    return s.trim().toLowerCase();
}

export default function NotesListScreen() {
    const router = useRouter();


    const { notesById, noteIds, query, tagFilter, setQuery, setTagFilter, createNote } =
        useNotesStore(
            useShallow((s) => ({
                notesById: s.notesById,
                noteIds: s.noteIds,
                query: s.query,
                tagFilter: s.tagFilter,
                setQuery: s.setQuery,
                setTagFilter: s.setTagFilter,
                createNote: s.createNote,
            }))
        );

    const notes = useMemo(() => {
        const q = normalizeText(query);

        const all = noteIds
            .map((id) => notesById[id])
            .filter(Boolean);

        all.sort((a, b) => {
            if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
            return b.updatedAt - a.updatedAt;
        });

        return all.filter((n) => {
            const matchesTag = tagFilter ? n.tags.includes(tagFilter) : true;
            if (!matchesTag) return false;
            if (!q) return true;

            const hay = normalizeText(`${n.title} ${n.body} ${n.tags.join(" ")}`);
            return hay.includes(q);
        });
    }, [noteIds, notesById, query, tagFilter]);

    const tags = useMemo(() => {
        const set = new Set<string>();
        Object.values(notesById).forEach((n) => n.tags.forEach((t) => set.add(t)));
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [notesById]);

    return (
        <View style={{ flex: 1, padding: 16, gap: 12 }}>
            <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
                <View style={{ flex: 1 }}>
                    <SearchBar value={query} onChange={setQuery} />
                </View>

                <Pressable
                    onPress={() => {
                        const id = createNote();
                        router.push({ pathname: "/note/[noteId]", params: { noteId: id } });
                    }}
                    style={{ borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12 }}
                >
                    <Text>+ New</Text>
                </Pressable>
            </View>

            <TagChips tags={tags} selected={tagFilter} onSelect={setTagFilter} />

            <FlatList
                data={notes}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
                renderItem={({ item }) => (
                    <NoteRow
                        note={item}
                        onPress={() =>
                            router.push({ pathname: "/note/[noteId]", params: { noteId: item.id } })
                        }
                    />
                )}
                ListEmptyComponent={
                    <View style={{ paddingTop: 40, alignItems: "center", gap: 8 }}>
                        <Text style={{ fontSize: 18, fontWeight: "600" }}>No notes yet</Text>
                        <Text style={{ opacity: 0.7 }}>Tap “+ New” to create your first note.</Text>
                    </View>
                }
            />
        </View>
    );
}
