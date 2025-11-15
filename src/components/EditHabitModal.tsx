import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Button, Dialog, Portal, TextInput, Text } from "react-native-paper";
import { useSQLiteContext } from "expo-sqlite";
import { updateHabit } from "@/db/db";
import { Habit } from "@/types/habit";

type Props = {
  habit: Habit; // Dữ liệu thói quen cần sửa
  onDismiss: () => void;
  onSave: () => void; // Callback để refresh list sau khi lưu
};

const EditHabitModal = ({ habit, onDismiss, onSave }: Props) => {
  const db = useSQLiteContext();
  // Khởi tạo state với giá trị hiện tại của habit
  const [title, setTitle] = useState(habit.title);
  const [description, setDescription] = useState(habit.description || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpdate = async () => {
    // 1. Validate title không được rỗng
    if (!title.trim()) {
      setError("Tiêu đề (Title) không được để trống.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      // 2. Thực hiện UPDATE
      await updateHabit(db, habit.id, title.trim(), description.trim());

      // 3. Đóng modal
      onDismiss();

      // 4. Gọi callback để refresh danh sách
      onSave();
    } catch (e) {
      console.error("Error updating habit:", e);
      Alert.alert("Lỗi", "Không thể cập nhật thói quen. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
      <Dialog visible={!!habit} onDismiss={onDismiss}>
        <Dialog.Title>Chỉnh Sửa Thói Quen</Dialog.Title>
        <Dialog.Content>
          <TextInput
            label="Tiêu đề (Bắt buộc)"
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              if (error) setError("");
            }}
            mode="outlined"
            className="mb-3"
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TextInput
            label="Mô tả (Tùy chọn)"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            numberOfLines={4}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss} disabled={loading}>
            Hủy
          </Button>
          <Button onPress={handleUpdate} loading={loading} mode="contained">
            Lưu
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  errorText: {
    color: "red",
    marginBottom: 8,
  },
});

export default EditHabitModal;
