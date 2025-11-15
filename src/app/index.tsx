import { Link, useFocusEffect } from "expo-router";
import React, { useState, useCallback } from "react";
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
import { getAllHabits } from "@/db/db";
import HabitItem from "@/components/HabitItem";
import AddHabitModal from "@/components/AddHabitModal";

export default function Page() {
  const db = useSQLiteContext();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);

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

  // 3. Hiển thị danh sách
  return (
    <View className="flex flex-1">
      <Text className="text-2xl font-bold p-4">Danh sách Thói quen</Text>
      <FlatList
        data={habits}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <HabitItem data={item} />}
        contentContainerStyle={{ flexGrow: 1 }}
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
        onHabitAdded={handleHabitAdded} // Pass callback
      />
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
