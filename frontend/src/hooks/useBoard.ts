import { useCallback } from "react";
import { useBoardContext } from "@/context/BoardContext";
import {
  GetAllBoards,
  CreateBoard,
  UpdateBoard,
  DeleteBoard,
  GetBoardWithData,
} from "../../wailsjs/go/adapter/Handler";

export function useBoard() {
  const {
    boards,
    setBoards,
    activeBoard,
    setActiveBoard,
    activeBoardId,
    setActiveBoardId,
    triggerRefresh,
  } = useBoardContext();

  const loadBoards = useCallback(async () => {
    const list = await GetAllBoards();
    setBoards(list);
    return list;
  }, [setBoards]);

  const loadBoard = useCallback(
    async (id: string) => {
      const data = await GetBoardWithData(id);
      setActiveBoard(data);
      setActiveBoardId(id);
      return data;
    },
    [setActiveBoard, setActiveBoardId]
  );

  const createBoard = useCallback(
    async (title: string) => {
      const board = await CreateBoard(title);
      await loadBoards();
      return board;
    },
    [loadBoards]
  );

  const updateBoard = useCallback(
    async (id: string, title: string) => {
      const board = await UpdateBoard(id, title);
      await loadBoards();
      if (activeBoardId === id) {
        await loadBoard(id);
      }
      return board;
    },
    [loadBoards, loadBoard, activeBoardId]
  );

  const deleteBoard = useCallback(
    async (id: string) => {
      await DeleteBoard(id);
      const remaining = await loadBoards();
      if (activeBoardId === id) {
        if (remaining.length > 0) {
          await loadBoard(remaining[0].id);
        } else {
          setActiveBoard(null);
          setActiveBoardId(null);
        }
      }
    },
    [loadBoards, loadBoard, activeBoardId, setActiveBoard, setActiveBoardId]
  );

  return {
    boards,
    activeBoard,
    setActiveBoard,
    activeBoardId,
    loadBoards,
    loadBoard,
    createBoard,
    updateBoard,
    deleteBoard,
    triggerRefresh,
  };
}
