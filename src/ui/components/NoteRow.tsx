import React, { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { Note } from "../../domain/models/Note";

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleString();
}

function NoteRow({
  note,
  onPress,
}: {
  note: Note;
  onPress: () => void;
}) {
  const title = note.title.trim() || "Untitled";
  const preview = note.body.trim().slice(0, 80);

  return (
    <Pressable
      onPress={onPress}
      style={{ borderWidth: 1, borderRadius: 12, padding: 12, gap: 6 }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: "600", flex: 1 }}>
          {note.pinned ? "📌 " : ""}
          {title}
        </Text>
        <Text style={{ opacity: 0.6, fontSize: 12 }}>{formatTime(note.updatedAt)}</Text>
      </View>

      {preview ? <Text style={{ opacity: 0.8 }}>{preview}</Text> : null}

      {note.tags.length ? (
        <Text style={{ opacity: 0.7, fontSize: 12 }}>#{note.tags.join("  #")}</Text>
      ) : null}
    </Pressable>
  );
}

export default memo(NoteRow);
