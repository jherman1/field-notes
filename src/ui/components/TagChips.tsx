
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function TagChips({
  tags,
  selected,
  onSelect,
}: {
  tags: string[];
  selected: string | null;
  onSelect: (tag: string | null) => void;
}) {
  if (tags.length === 0) return null;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 50 }}>
      <View style={{ flexDirection: "row", gap: 8, paddingVertical: 8 }}>
        <Chip label="All" active={selected === null} onPress={() => onSelect(null)} />
        {tags.map((t) => (
          <Chip key={t} label={t} active={selected === t} onPress={() => onSelect(t)} />
        ))}
      </View>
    </ScrollView>
  );
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        opacity: active ? 1 : 0.6,
      }}
    >
      <Text>{label}</Text>
    </Pressable>
  );
}
