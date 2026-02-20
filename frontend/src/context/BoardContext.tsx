import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { domain, application } from "../../wailsjs/go/models";

interface BoardContextType {
  boards: domain.Board[];
  setBoards: (boards: domain.Board[]) => void;
  activeBoard: application.BoardData | null;
  setActiveBoard: (data: application.BoardData | null) => void;
  activeBoardId: string | null;
  setActiveBoardId: (id: string | null) => void;
  refreshKey: number;
  triggerRefresh: () => void;
}

const BoardContext = createContext<BoardContextType | null>(null);

export function BoardProvider({ children }: { children: ReactNode }) {
  const [boards, setBoards] = useState<domain.Board[]>([]);
  const [activeBoard, setActiveBoard] = useState<application.BoardData | null>(null);
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <BoardContext.Provider
      value={{
        boards,
        setBoards,
        activeBoard,
        setActiveBoard,
        activeBoardId,
        setActiveBoardId,
        refreshKey,
        triggerRefresh,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
}

export function useBoardContext() {
  const ctx = useContext(BoardContext);
  if (!ctx) {
    throw new Error("useBoardContext must be used within a BoardProvider");
  }
  return ctx;
}
