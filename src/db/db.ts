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

// Hàm mới: Cập nhật thông tin thói quen (Câu 6)
export const updateHabit = async (
  db: SQLiteDatabase,
  id: number,
  title: string,
  description: string | undefined
) => {
  await db.runAsync(
    `
    UPDATE habits 
    SET title = ?, description = ? 
    WHERE id = ?
    `,
    [title, description || null, id]
  );
};

export const deleteHabit = async (db: SQLiteDatabase, id: number) => {
  await db.runAsync(`DELETE FROM habits WHERE id = ?`, [id]);
};

// Hàm mới: Chèn danh sách thói quen (có kiểm tra trùng lặp title)
export const insertNewHabits = async (
  db: SQLiteDatabase,
  // ĐÃ SỬA: Thêm 'created_at' vào Omit
  newHabits: Omit<Habit, "id" | "done_today" | "created_at">[]
) => {
  try {
    // 1. Lấy tất cả title hiện có (chuyển về chữ thường để so sánh không phân biệt chữ hoa/thường)
    const existingTitlesResult = await db.getAllAsync<{ title: string }>(
      "SELECT title FROM habits;"
    );
    const existingTitles = new Set(
      existingTitlesResult.map((r) => r.title.toLowerCase())
    );

    // 2. Lọc ra các thói quen cần chèn (chưa tồn tại)
    const habitsToInsert = newHabits.filter((habit) => {
      // Bỏ qua nếu title đã tồn tại
      return !existingTitles.has(habit.title.toLowerCase());
    });

    if (habitsToInsert.length === 0) {
      return { success: true, count: 0 };
    }

    const now = Date.now();

    // 3. Chuẩn bị và thực hiện các lệnh INSERT khối (sử dụng Promise.all để song song hóa)
    const insertStatements = habitsToInsert.map((habit, index) => {
      // Dùng created_at riêng biệt để giữ thứ tự nếu cần
      return db.runAsync(
        // Giá trị created_at được gán ở đây, nên không cần nó trong kiểu dữ liệu đầu vào
        `INSERT INTO habits (title, description, active, done_today, created_at) VALUES (?, ?, ?, 0, ?)`,
        [
          habit.title,
          habit.description || null,
          habit.active ? 1 : 0,
          now + index,
        ]
      );
    });

    await Promise.all(insertStatements);

    return { success: true, count: habitsToInsert.length };
  } catch (error) {
    console.error("Error inserting new habits:", error);
    throw new Error("Không thể chèn thói quen mới vào database.");
  }
};
