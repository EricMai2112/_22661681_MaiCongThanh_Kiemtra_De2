import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import "../global.css";
import { Slot, Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { initTable } from "@/db/db";

export default function Layout() {
  return (
    <SQLiteProvider databaseName="app.db" onInit={(db) => initTable(db)}>
      <SafeAreaProvider>
        <SafeAreaView>
          <Stack screenOptions={{ headerShown: false }}></Stack>
        </SafeAreaView>
      </SafeAreaProvider>
    </SQLiteProvider>
  );
}
