import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Field Notes" }} />
      <Stack.Screen name="note/[noteId]" options={{ title: "Note" }} />
      <Stack.Screen name="note/new" options={{ title: "New Note" }} />
    </Stack>
  );
}