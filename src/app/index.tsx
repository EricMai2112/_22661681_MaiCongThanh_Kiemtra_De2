import { Link, useFocusEffect } from "expo-router";
import React, { useState, useCallback, useMemo } from "react";
import {
  Text,
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { Habit } from "@/types/habit";
import { deleteHabit, getAllHabits, toggleHabitDoneToday } from "@/db/db";
import HabitItem from "@/components/HabitItem";
import AddHabitModal from "@/components/AddHabitModal";
import EditHabitModal from "@/components/EditHabitModal";
import { TextInput } from "react-native-paper";

export default function Page() {
  const db = useSQLiteContext();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [searchText, setSearchText] = useState("");

  // Hàm lấy dữ liệu
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllHabits(db);
      setHabits(data);
    } catch (error) {
      console.error("Failed to fetch habits:", error);
      setHabits([]);
    } finally {
      setLoading(false);
    }
  }, [db]);

  // Sử dụng useFocusEffect để gọi fetchData mỗi khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const filteredHabits = useMemo(() => {
    if (!searchText) {
      return habits; // Nếu không có từ khóa, trả về toàn bộ danh sách
    }

    const lowerCaseSearch = searchText.toLowerCase();

    // Lọc theo title
    return habits.filter((habit) =>
      habit.title.toLowerCase().includes(lowerCaseSearch)
    );
    // Danh sách chỉ tính toán lại khi habits hoặc searchText thay đổi
  }, [habits, searchText]);

  // Handler mở Modal chỉnh sửa
  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
  };

  // Handler đóng Modal chỉnh sửa và Refresh
  const handleCloseEditModal = () => {
    setEditingHabit(null);
    handleRefresh();
  };

  // Hàm refresh list (dùng cho cả AddHabitModal và Toggle)
  const handleRefresh = () => {
    fetchData();
  };
  // Hàm mới: Xử lý toggle và refresh (Câu 5)
  const handleToggleHabit = async (id: number, currentStatus: boolean) => {
    try {
      await toggleHabitDoneToday(db, id, currentStatus);
      handleRefresh(); // Tải lại dữ liệu sau khi cập nhật
    } catch (error) {
      console.error("Failed to toggle habit status:", error);
    }
  };

  // 1. Trạng thái Loading
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
        <Text className="mt-4">Đang tải thói quen...</Text>
      </View>
    );
  }

  // 2. Trạng thái Empty State
  if (habits.length === 0 && !loading) {
    return (
      <View className="flex-1 justify-center items-center p-8">
        <Text className="text-xl font-bold text-center">
          Chưa có thói quen nào, hãy thêm một thói quen mới!
        </Text>
        {/* Giả định có màn hình tạo thói quen mới */}
        <Link href="/add" className="mt-4 text-blue-500 text-lg">
          Thêm thói quen mới
        </Link>
      </View>
    );
  }

  const handleHabitAdded = () => {
    fetchData(); // Tải lại dữ liệu sau khi thêm thành công
  };

  // Hàm mới: Xử lý xóa thói quen (Câu 7)
  const handleDeleteHabit = async (id: number) => {
    try {
      await deleteHabit(db, id);
      handleRefresh(); // Tải lại dữ liệu sau khi xóa
    } catch (error) {
      console.error("Failed to delete habit:", error);
    }
  };

  // 3. Hiển thị danh sách
  return (
    <View className="flex flex-1">
      <Text className="text-2xl font-bold p-4">Danh sách Thói quen</Text>

      {/* Thêm TextInput Search */}
      <TextInput
        label="Tìm kiếm thói quen..."
        value={searchText}
        onChangeText={setSearchText}
        mode="outlined"
        className="mx-4 mb-4"
        right={<TextInput.Icon icon="magnify" />}
      />

      <FlatList
        data={filteredHabits} // SỬ DỤNG filteredHabits
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <HabitItem
            data={item}
            onToggle={handleToggleHabit}
            onEdit={handleEditHabit}
            onDelete={handleDeleteHabit}
          />
        )}
        contentContainerStyle={{ flexGrow: 1 }}
        // Hiển thị thông báo khi không có kết quả tìm kiếm
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center p-8">
            {searchText ? (
              <Text className="text-lg text-gray-500">
                Không tìm thấy thói quen nào khớp với "{searchText}".
              </Text>
            ) : null}
          </View>
        )}
      />

      {/* Nút "+" để mở Modal */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Modal thêm thói quen mới */}
      <AddHabitModal
        visible={isModalVisible}
        onDismiss={() => setIsModalVisible(false)}
        onHabitAdded={handleRefresh} // Pass callback
      />
      {/* Modal chỉnh sửa thói quen mới */}
      {editingHabit && (
        <EditHabitModal
          habit={editingHabit}
          onDismiss={handleCloseEditModal}
          onSave={handleCloseEditModal} // onSave gọi handleCloseEditModal để đóng và refresh
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: "#3b82f6", // blue-500
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabText: {
    color: "white",
    fontSize: 30,
    lineHeight: 30,
  },
});
