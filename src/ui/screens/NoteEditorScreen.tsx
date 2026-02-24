
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { Note } from "../../domain/models/Note";
import { useNotesStore } from "../../state/notesStore";

export default function NoteEditorScreen({ noteId }: { noteId: string }) {
  const router = useRouter();
  const getNote = useNotesStore((s) => s.getNote);
  const upsertNote = useNotesStore((s) => s.upsertNote);
  const deleteNote = useNotesStore((s) => s.deleteNote);

  const note = useMemo(() => getNote(noteId), [noteId, getNote]);

  const [title, setTitle] = useState(note?.title ?? "");
  const [body, setBody] = useState(note?.body ?? "");
  const [tagsText, setTagsText] = useState(note?.tags.join(", ") ?? "");
  const [pinned, setPinned] = useState(note?.pinned ?? false);

  if (!note) {
    return (
      <View style={{ flex: 1, padding: 16, justifyContent: "center", alignItems: "center" }}>
        <Text>Note not found.</Text>
      </View>
    );
  }

  const onSave = () => {
    const tags = tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const next: Note = {
      ...note,
      title,
      body,
      tags: Array.from(new Set(tags)),
      pinned,
      updatedAt: Date.now(),
    };

    upsertNote(next);
    router.back();
  };

  const onDelete = () => {
    Alert.alert("Delete note?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteNote(noteId);
          router.back();
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <Pressable
          onPress={() => setPinned((p) => !p)}
          style={{ borderWidth: 1, borderRadius: 10, padding: 12 }}
        >
          <Text>{pinned ? "📌 Pinned" : "Pin"}</Text>
        </Pressable>

        <View style={{ flex: 1 }} />

        <Pressable onPress={onDelete} style={{ borderWidth: 1, borderRadius: 10, padding: 12 }}>
          <Text>Delete</Text>
        </Pressable>

        <Pressable onPress={onSave} style={{ borderWidth: 1, borderRadius: 10, padding: 12 }}>
          <Text>Save</Text>
        </Pressable>
      </View>

      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
        style={{ borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 18, fontWeight: "600" }}
      />

      <TextInput
        value={tagsText}
        onChangeText={setTagsText}
        placeholder="Tags (comma separated)"
        autoCapitalize="none"
        style={{ borderWidth: 1, borderRadius: 10, padding: 12 }}
      />

      <TextInput
        value={body}
        onChangeText={setBody}
        placeholder="Write your note…"
        multiline
        textAlignVertical="top"
        style={{ flex: 1, borderWidth: 1, borderRadius: 10, padding: 12 }}
      />
    </View>
  );
}
