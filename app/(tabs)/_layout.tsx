import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#2e7d32",
        tabBarInactiveTintColor: "#757575",
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          title: "FoodSave",
          tabBarLabel: "Início",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="alimentos/index"
        options={{
          title: "Meus Alimentos",
          tabBarLabel: "Alimentos",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="nutrition-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="alertas/index"
        options={{
          title: "Alertas",
          tabBarLabel: "Alertas",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="perfil/index"
        options={{
          title: "Perfil",
          tabBarLabel: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}