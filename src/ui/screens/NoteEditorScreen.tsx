
import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { Note } from "../../domain/models/Note";
import { useNotesStore } from "../../state/notesStore";
import { useDebouncedEffect } from "../hooks/useDebouncedEffect";

type SaveStatus = "idle" | "saving" | "saved";

function normalizeTagsInput(tagsText: string) {
  return Array.from(
    new Set(
      tagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    )
  );
}

function stableSnapshot(note: Note) {
  // Only include fields that should trigger a save if changed
  return JSON.stringify({
    title: note.title,
    body: note.body,
    tags: note.tags,
    pinned: note.pinned,
  });
}

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

  const [status, setStatus] = useState<SaveStatus>("idle");

  // Holds the last saved snapshot so we can detect "dirty"
  const lastSavedRef = useRef<string | null>(null);

  if (!note) {
    return (
      <View style={{ flex: 1, padding: 16, justifyContent: "center", alignItems: "center" }}>
        <Text>Note not found.</Text>
      </View>
    );
  }

  // Inititalize lastSavedRef once we have a note
  if (lastSavedRef.current === null) {
    lastSavedRef.current = stableSnapshot(note);
  }

  const buildNextNote = (): Note => {
    const tags = normalizeTagsInput(tagsText);
    return {
      ...note,
      title,
      body,
      tags,
      pinned,
      updatedAt: Date.now(),
    };
  };

  const commitSaveIfDirty = async () => {
    // console.log("AUTOSAVE", new Date().toISOString(), { title, pinned });
    const next = buildNextNote();
    const snap = stableSnapshot(next);

    if (snap === lastSavedRef.current) {
      // No meaningful changes since last save
      return
    }

    setStatus("saving");

    upsertNote(next);
    lastSavedRef.current = snap;

    // Allow UI to paint "Saving..." (next tick)
    await new Promise((r) => setTimeout(r, 300));

    setStatus("saved");
  }

  useDebouncedEffect(
    () => {
      void commitSaveIfDirty();
    },
    [title, body, tagsText, pinned],
    600
  );

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

  const onDone = () => {
    // Ensure we don't lose last edits if user hits Done quickly
    void commitSaveIfDirty();
    router.back();
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <Pressable
          onPress={() => setPinned((p) => !p)}
          style={{ borderWidth: 1, borderRadius: 10, padding: 12 }}
        >
          <Text>{pinned ? "📌 Pinned" : "Pin"}</Text>
        </Pressable>

        <View style={{ flex: 1 }}>
          <Text style={{ textAlign: "center", opacity: 0.7 }}>
            {status === "saving" ? "Saving..." : status === "saved" ? "Saved" : ""}
          </Text>
        </View>

        <Pressable onPress={onDelete} style={{ borderWidth: 1, borderRadius: 10, padding: 12 }}>
          <Text>Delete</Text>
        </Pressable>

        <Pressable onPress={onDone} style={{ borderWidth: 1, borderRadius: 10, padding: 12 }}>
          <Text>Done</Text>
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
