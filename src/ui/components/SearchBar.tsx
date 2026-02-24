
import React from "react";
import { TextInput, View } from "react-native";

export default function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={{ borderWidth: 1, borderRadius: 10, paddingHorizontal: 12 }}>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Search notes…"
        autoCapitalize="none"
        autoCorrect={false}
        style={{ height: 44 }}
      />
    </View>
  );
}
