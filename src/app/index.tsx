import { Link, useFocusEffect } from "expo-router";
import React, { useState, useCallback } from "react";
import { Text, View, FlatList, ActivityIndicator } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { Habit } from "@/types/habit";
import { getAllHabits } from "@/db/db";
import HabitItem from "@/components/HabitItem";

export default function Page() {
  const db = useSQLiteContext();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

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
    </View>
  );
}
