import { Habit } from "@/types/habit";
import { SQLiteDatabase } from "expo-sqlite";
interface RawHabit extends Omit<Habit, "active" | "done_today"> {
  active: number;
  done_today: number;
}
export const initTable = async (db: SQLiteDatabase) => {
  await db.execAsync(`
        CREATE TABLE IF NOT EXISTS habits(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            active INTEGER DEFAULT 1,
            done_today INTEGER DEFAULT 0,
            created_at INTEGER
        )
        `);

  try {
    const countResult = await db.getFirstAsync<{ count: number }>(
      "SELECT count(id) as count FROM habits;"
    );

    if (countResult && countResult.count === 0) {
      console.log("Seeding sample habits data...");
      const now = Date.now();

      await db.execAsync(`
            INSERT INTO habits (title, description, active, done_today, created_at) VALUES 
            ('Uống 2 lít nước', 'Uống đủ 2 lít nước mỗi ngày để giữ cơ thể khỏe mạnh', 1, 0, ${now}),
            ('Đi bộ 15 phút', 'Đi bộ nhanh 15 phút mỗi ngày', 1, 0, ${now + 1}),
            ('Đọc sách 30 phút', 'Dành 30 phút đọc sách trước khi ngủ', 1, 0, ${
              now + 2
            });
        `);
      console.log("Sample habits seeded successfully.");
    }
  } catch (error) {
    console.error("Error during table initialization or seeding:", error);
  }
};

// Hàm mới: Lấy danh sách thói quen
export const getAllHabits = async (db: SQLiteDatabase): Promise<Habit[]> => {
  try {
    // Truy vấn tất cả thói quen đang hoạt động, sử dụng kiểu RawHabit
    // Điều này giúp TypeScript hiểu rằng habit.done_today là number
    const allHabits = await db.getAllAsync<RawHabit>(
      "SELECT * FROM habits WHERE active = 1 ORDER BY created_at DESC;"
    );

    // Chuyển đổi giá trị INTEGER (0/1) thành BOOLEAN
    // Phép so sánh (number === number, trả về boolean) giờ đây là hợp lệ
    return allHabits.map((habit) => ({
      ...habit,
      active: habit.active === 1,
      done_today: habit.done_today === 1,
    }));
  } catch (error) {
    console.error("Error fetching all habits:", error);
    return [];
  }
};

// Hàm mới: Thêm thói quen mới vào database
export const insertHabit = async (
  db: SQLiteDatabase,
  title: string,
  description: string | undefined
) => {
  const now = Date.now();
  await db.runAsync(
    `
    INSERT INTO habits (title, description, active, done_today, created_at)
    VALUES (?, ?, 1, 0, ?)
    `,
    [title, description || null, now]
  );
};

// Hàm mới: Chuyển đổi trạng thái done_today (Câu 5)
export const toggleHabitDoneToday = async (
  db: SQLiteDatabase,
  id: number,
  currentStatus: boolean
) => {
  // Nếu đang done (true), chuyển về 0 (false). Ngược lại, chuyển về 1 (true).
  const newStatus = currentStatus ? 0 : 1;
  await db.runAsync(`UPDATE habits SET done_today = ? WHERE id = ?`, [
    newStatus,
    id,
  ]);
};
