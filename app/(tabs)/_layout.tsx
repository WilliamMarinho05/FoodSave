import { Tabs , useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {Pressable, Text} from "react-native";

export default function TabsLayout() {
    const router = useRouter();
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitle: () => (
            <Pressable onPress={() => router.push("/")}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
              }}
            >
              FoodSave
            </Text>
          </Pressable>
        ),
        tabBarActiveTintColor: "#65B32E",
        tabBarInactiveTintColor: "#D5D5D5",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          height: 60,
          borderTopWidth: 1,
          borderTopColor: "#E5E5E5",
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="home-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="alimentos"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="fridge-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="alertas"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="notifications-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="perfil"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="person-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}