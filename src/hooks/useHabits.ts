import { useState, useCallback, useMemo } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { Habit } from "@/types/habit";
import {
  getAllHabits,
  insertHabit,
  updateHabit,
  deleteHabit,
  toggleHabitDoneToday,
  insertNewHabits,
} from "@/db/db";

// Mock API URL
const API_URL = "https://67e227a797fc65f53534c8a2.mockapi.io/apiTodo/habits";

export const useHabits = () => {
  const db = useSQLiteContext();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");

  // Hàm load danh sách (useCallback để tối ưu)
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Tạm thời bỏ qua filter active để thấy dữ liệu import (theo fix trước đó)
      const data = await getAllHabits(db);
      setHabits(data);
    } catch (error) {
      console.error("Failed to fetch habits:", error);
      setHabits([]);
    } finally {
      setLoading(false);
    }
  }, [db]); // Phụ thuộc vào instance DB

  // Hàm refresh list (useCallback)
  const handleRefresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Handler thêm mới (useCallback)
  const handleInsertHabit = useCallback(
    async (title: string, description: string | undefined) => {
      await insertHabit(db, title, description);
      handleRefresh();
    },
    [db, handleRefresh]
  );

  // Handler toggle done (useCallback)
  const handleToggleHabit = useCallback(
    async (id: number, currentStatus: boolean) => {
      await toggleHabitDoneToday(db, id, currentStatus);
      handleRefresh();
    },
    [db, handleRefresh]
  );

  // Handler xóa (useCallback)
  const handleDeleteHabit = useCallback(
    async (id: number) => {
      await deleteHabit(db, id);
      handleRefresh();
    },
    [db, handleRefresh]
  );

  // Handler sửa (useCallback)
  const handleUpdateHabit = useCallback(
    async (id: number, title: string, description: string | undefined) => {
      await updateHabit(db, id, title, description);
      handleRefresh();
    },
    [db, handleRefresh]
  );

  // Handler Import từ API (useCallback)
  const handleImportHabits = useCallback(
    async (showAlert: (title: string, msg: string) => void) => {
      setIsImporting(true);
      setImportError(null);

      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`Lỗi server: ${response.statusText}`);
        }
        const apiData = await response.json();

        if (!Array.isArray(apiData)) {
          throw new Error("Dữ liệu API không hợp lệ.");
        }

        const newHabitsToInsert = apiData.map((item: any) => ({
          title: item.name || "Thói quen không tên",
          description: item.description || "",
          active: item.is_active === true,
        }));

        const result = await insertNewHabits(db, newHabitsToInsert);

        if (result.success) {
          showAlert(
            "Thành công",
            `Đã nhập ${result.count} thói quen mới từ API.`
          );
          handleRefresh();
        }
      } catch (error) {
        console.error("Import API failed:", error);
        const errorMessage =
          (error as Error).message || "Không thể kết nối đến API.";
        setImportError(errorMessage);
        showAlert("Lỗi Import", `Không thể nhập thói quen: ${errorMessage}`);
      } finally {
        setIsImporting(false);
      }
    },
    [db, handleRefresh]
  );

  // Logic Filtering sử dụng useMemo (Tối ưu search)
  const filteredHabits = useMemo(() => {
    if (!searchText) {
      return habits;
    }

    const lowerCaseSearch = searchText.toLowerCase();

    return habits.filter((habit) =>
      habit.title.toLowerCase().includes(lowerCaseSearch)
    );
  }, [habits, searchText]);

  return {
    habits: filteredHabits, // Trả về danh sách đã lọc
    loading,
    isImporting,
    importError,
    searchText,
    setSearchText, // Để UI điều khiển TextInput
    fetchData, // Để gọi load lần đầu và Pull to Refresh
    handleRefresh,
    handleInsertHabit,
    handleUpdateHabit,
    handleDeleteHabit,
    handleToggleHabit,
    handleImportHabits,
  };
};
