
import { useLocalSearchParams } from "expo-router";
import NoteEditorScreen from "../../src/ui/screens/NoteEditorScreen";

export default function NoteRoute() {
  const { noteId } = useLocalSearchParams<{ noteId: string }>();

  // expo-router params can be string | string[] | undefined in edge cases
  const id = Array.isArray(noteId) ? noteId[0] : noteId;

  if (!id) return null;

  return <NoteEditorScreen noteId={id} />;
}
