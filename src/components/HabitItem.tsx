import { View, Text } from "react-native";
import React from "react";
import { Habit } from "@/types/habit";
import { useRouter } from "expo-router";
import { Button, Card } from "react-native-paper";

type Props = {
  data: Habit;
};
const HabitItem = ({ data }: Props) => {
  const router = useRouter();

  return (
    <View className="my-2 mx-4">
      <Card>
        <Card.Title title={data.title}></Card.Title>
        <Card.Content>
          <Text>Description: {data.description}</Text>
          <Text>Done_Today: {data.done_today ? "Done" : "Not done"}</Text>
        </Card.Content>
        <Card.Actions>
          <Button mode="contained">Edit</Button>
          <Button mode="contained">Delete</Button>
        </Card.Actions>
      </Card>
    </View>
  );
};

export default HabitItem;
