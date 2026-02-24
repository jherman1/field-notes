
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { useNotesStore } from "../../src/state/notesStore";

export default function NewNoteRoute() {
  const router = useRouter();
  const createNote = useNotesStore((s) => s.createNote);

  useEffect(() => {
    const id = createNote();
    router.replace(`/note/${id}`);
  }, [createNote, router]);

  return null;
}