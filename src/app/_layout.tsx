import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import "../global.css";
import { Slot, Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { initTable } from "@/db/db";
import { Text } from "react-native";
import { PaperProvider } from "react-native-paper";

export default function Layout() {
  return (
    <PaperProvider>
      <SQLiteProvider databaseName="app.db" onInit={(db) => initTable(db)}>
        <SafeAreaProvider>
          <SafeAreaView className="flex flex-1">
            <Text className="text-3xl text-center font-bold">
              Habit Tracker
            </Text>
            <Stack screenOptions={{ headerShown: false }}></Stack>
          </SafeAreaView>
        </SafeAreaProvider>
      </SQLiteProvider>
    </PaperProvider>
  );
}
