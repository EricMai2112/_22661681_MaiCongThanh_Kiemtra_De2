import { View, Text, TouchableOpacity, Alert } from "react-native"; // Thêm Alert
import React from "react";
import { Habit } from "@/types/habit";
import { useRouter } from "expo-router";
import { Button, Card, useTheme } from "react-native-paper";

type Props = {
  data: Habit;
  onToggle: (id: number, currentStatus: boolean) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (id: number) => void; // Prop mới: Handler xóa
};

const HabitItem = ({ data, onToggle, onEdit, onDelete }: Props) => {
  const router = useRouter();
  const theme = useTheme();

  const handleToggle = () => {
    onToggle(data.id, data.done_today);
  };

  // Hàm xử lý xóa có xác nhận
  const handleDelete = () => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa thói quen "${data.title}"?`,
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => onDelete(data.id), // Gọi handler xóa khi xác nhận
        },
      ]
    );
  };

  const cardStyle = data.done_today
    ? { backgroundColor: theme.colors.surfaceDisabled, opacity: 0.8 }
    : { backgroundColor: theme.colors.surface };

  return (
    <TouchableOpacity onPress={handleToggle} activeOpacity={0.7}>
      <View className="my-2 mx-4">
        <Card style={cardStyle}>
          <Card.Title
            title={data.title}
            right={(props) =>
              data.done_today && (
                <Text
                  {...props}
                  className="mr-4 text-green-600 font-bold text-lg"
                >
                  ✓ DONE
                </Text>
              )
            }
          ></Card.Title>
          <Card.Content>
            <Text
              style={{
                textDecorationLine: data.done_today ? "line-through" : "none",
              }}
            >
              Description: {data.description}
            </Text>
            <Text
              className="mt-1 font-bold"
              style={{ color: data.done_today ? "green" : "red" }}
            >
              Trạng thái: {data.done_today ? "Đã Xong" : "Chưa Xong"}
            </Text>
          </Card.Content>
          <Card.Actions>
            <Button mode="contained" onPress={() => onEdit(data)}>
              Edit
            </Button>
            {/* Gắn sự kiện Xóa */}
            <Button
              mode="contained"
              onPress={handleDelete}
              buttonColor={theme.colors.error}
            >
              Delete
            </Button>
          </Card.Actions>
        </Card>
      </View>
    </TouchableOpacity>
  );
};

export default HabitItem;
