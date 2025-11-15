import { Link, useFocusEffect } from "expo-router";
import React, { useState, useCallback, useEffect } from "react"; 
import { // Import RefreshControl
  Text,
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { Habit } from "@/types/habit";
import HabitItem from "@/components/HabitItem";
import AddHabitModal from "@/components/AddHabitModal";
import EditHabitModal from "@/components/EditHabitModal";
import { TextInput, Button } from "react-native-paper"; 
import { useHabits } from "@/hooks/useHabits"; // Import custom hook

// Helper function cho Alert (để dùng trong hook)
const showAlert = (title: string, msg: string) => Alert.alert(title, msg);

export default function Page() {
  const { 
    habits, 
    loading, 
    isImporting, 
    importError, 
    searchText, 
    setSearchText, 
    fetchData, 
    handleRefresh,
    handleToggleHabit,
    handleDeleteHabit,
    handleImportHabits,
    // Không cần handleInsert/handleUpdate ở đây, chúng sẽ được gọi qua Modals
  } = useHabits(); // Sử dụng Custom Hook
  
  // State UI
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  // Gọi load danh sách lần đầu
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );
  
  // Handler mở/đóng Modal Edit
  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
  };
  const handleCloseEditModal = () => {
    setEditingHabit(null);
    handleRefresh();
  };

  // --- UI Components ---

  // 1. Loading State
  if (loading && habits.length === 0) { // Chỉ hiển thị loading nếu danh sách rỗng
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-lg font-bold text-gray-700">Đang tải thói quen...</Text>
      </View>
    );
  }

  // 2. Empty State (Cải thiện UI/UX)
  const EmptyListComponent = () => {
    // Nếu không tìm kiếm và danh sách gốc rỗng
    if (!searchText && habits.length === 0) {
        return (
            <View className="flex-1 justify-center items-center p-8 mt-10">
                <Text style={styles.emptyIcon}>🧘</Text>
                <Text className="text-xl font-bold text-center text-gray-700 mt-4">
                    Chưa có thói quen nào.
                </Text>
                <Text className="text-base text-center text-gray-500 mt-2">
                    Hãy tạo thói quen mới hoặc import từ API để bắt đầu!
                </Text>
            </View>
        );
    }
    // Nếu là kết quả tìm kiếm rỗng
    if (searchText && habits.length > 0) {
        return (
            <View className="flex-1 justify-center items-center p-8 mt-10">
                <Text className="text-lg text-gray-500">
                    Không tìm thấy thói quen nào khớp với "{searchText}".
                </Text>
            </View>
        );
    }
    return null;
  };


  // 3. Main UI
  return (
    <View className="flex flex-1">
      <Text className="text-2xl font-bold p-4">Danh sách Thói quen</Text>
      
      {/* Nút Import và trạng thái */}
      <View className="mx-4 mb-4 flex-row items-center justify-between">
          <Button 
              mode="contained" 
              onPress={() => handleImportHabits(showAlert)} // Truyền helper alert vào hook
              loading={isImporting}
              disabled={isImporting || loading}
          >
              {isImporting ? "Đang Import..." : "Import từ API"}
          </Button>
          {importError && (
              <Text className="flex-1 ml-4" style={{ color: 'red', fontSize: 12 }}>
                  Lỗi: {importError}
              </Text>
          )}
      </View>

      {/* TextInput Search */}
      <TextInput
          label="Tìm kiếm thói quen..."
          value={searchText}
          onChangeText={setSearchText} // Dùng setSearchText từ hook
          mode="outlined"
          className="mx-4 mb-4"
          right={<TextInput.Icon icon="magnify" />}
          disabled={loading} // Disabled khi đang tải
      />

      <FlatList
        data={habits} // habits là filteredHabits từ hook
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
        ListEmptyComponent={EmptyListComponent}
        
        // Thêm Pull to Refresh
        refreshControl={
            <RefreshControl 
                refreshing={loading} 
                onRefresh={handleRefresh} 
            />
        }
      />
      
      {/* Nút FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsAddModalVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
      
      {/* Modal chỉnh sửa thói quen */}
      {editingHabit && (
        <EditHabitModal
          habit={editingHabit}
          onDismiss={handleCloseEditModal}
          onSave={handleCloseEditModal}
        />
      )}
      
      {/* Modal thêm thói quen mới */}
      <AddHabitModal
        visible={isAddModalVisible}
        onDismiss={() => setIsAddModalVisible(false)}
        onHabitAdded={handleRefresh} // onHabitAdded gọi handleRefresh
      />
    </View>
  );
}

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: '#3b82f6', 
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    fabText: {
        color: 'white',
        fontSize: 30,
        lineHeight: 30,
    },
    emptyIcon: {
        fontSize: 80,
    }
});