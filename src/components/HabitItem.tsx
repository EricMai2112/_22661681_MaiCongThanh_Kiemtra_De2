import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Habit } from "@/types/habit";
import { useRouter } from "expo-router";
import { Button, Card, useTheme } from "react-native-paper";

type Props = {
  data: Habit;
  // Prop mới để xử lý toggle và refresh list
  onToggle: (id: number, currentStatus: boolean) => void;
};

const HabitItem = ({ data, onToggle }: Props) => {
  const router = useRouter();
  const theme = useTheme();

  const handleToggle = () => {
    // Gọi hàm toggle với id và trạng thái hiện tại
    onToggle(data.id, data.done_today);
  };

  // Thay đổi style dựa trên trạng thái done_today
  const cardStyle = data.done_today
    ? { backgroundColor: theme.colors.surfaceDisabled, opacity: 0.8 } // Đã hoàn thành (màu nền nhạt hơn)
    : { backgroundColor: theme.colors.surface }; // Chưa hoàn thành (màu nền bình thường)

  return (
    // Sử dụng TouchableOpacity để toàn bộ Card có thể chạm được
    <TouchableOpacity onPress={handleToggle} activeOpacity={0.7}>
      <View className="my-2 mx-4">
        <Card style={cardStyle}>
          <Card.Title
            title={data.title}
            // Hiển thị icon check khi đã hoàn thành
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
            {/* Gạch ngang mô tả nếu đã hoàn thành */}
            <Text
              style={{
                textDecorationLine: data.done_today ? "line-through" : "none",
              }}
            >
              Description: {data.description}
            </Text>
            {/* Hiển thị trạng thái rõ ràng */}
            <Text
              className="mt-1 font-bold"
              style={{ color: data.done_today ? "green" : "red" }}
            >
              Trạng thái: {data.done_today ? "Đã Xong" : "Chưa Xong"}
            </Text>
          </Card.Content>
          {/* Giữ nguyên Card Actions, có thể loại bỏ nếu không dùng */}
          <Card.Actions>
            <Button mode="contained">Edit</Button>
            <Button mode="contained">Delete</Button>
          </Card.Actions>
        </Card>
      </View>
    </TouchableOpacity>
  );
};

export default HabitItem;
