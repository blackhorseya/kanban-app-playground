import { useEffect } from "react";
import "@/index.css";
import { BoardProvider } from "@/context/BoardContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Sidebar } from "@/components/layout/Sidebar";
import { BoardView } from "@/components/board/BoardView";
import { useBoard } from "@/hooks/useBoard";

function AppContent() {
  const { loadBoards } = useBoard();

  useEffect(() => {
    loadBoards();
  }, [loadBoards]);

  return (
    <AppLayout sidebar={<Sidebar />}>
      <BoardView />
    </AppLayout>
  );
}

function App() {
  return (
    <BoardProvider>
      <AppContent />
    </BoardProvider>
  );
}

export default App;
