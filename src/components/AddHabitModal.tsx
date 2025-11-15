import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Button, Dialog, Portal, TextInput, Text } from "react-native-paper";
import { useSQLiteContext } from "expo-sqlite";
import { insertHabit } from "@/db/db";

type Props = {
  visible: boolean;
  onDismiss: () => void;
  onHabitAdded: () => void; // Callback để refresh list sau khi thêm
};

const AddHabitModal = ({ visible, onDismiss, onHabitAdded }: Props) => {
  const db = useSQLiteContext();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    // 1. Validate title không được rỗng
    if (!title.trim()) {
      setError("Tiêu đề (Title) không được để trống.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      // 2. Thực hiện INSERT
      await insertHabit(db, title.trim(), description.trim());

      // 3. Reset form và đóng modal
      setTitle("");
      setDescription("");
      onDismiss();

      // 4. Gọi callback để refresh danh sách
      onHabitAdded();
    } catch (e) {
      console.error("Error inserting habit:", e);
      Alert.alert("Lỗi", "Không thể thêm thói quen. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>Thêm Thói Quen Mới</Dialog.Title>
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
          <Button onPress={handleSave} loading={loading} mode="contained">
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

export default AddHabitModal;
