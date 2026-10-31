import { CoresTema, useTheme } from "@/src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from "react-native";

export default function Configuracoes() {
  const router = useRouter();
  const { modoEscuro, alternarTema, cores } = useTheme();

  const [notificacoes, setNotificacoes] = useState(true);
  const [vencimento, setVencimento] = useState(true);
  const [vencidos, setVencidos] = useState(true);
  const [conquistas, setConquistas] = useState(true);

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: cores.fundo },
      ]}
      contentContainerStyle={styles.content}
    >
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={cores.primariaTexto}
          />
        </Pressable>

        <Text
          style={[
            styles.title,
            { color: cores.primariaTexto },
          ]}
        >
          CONFIGURAÇÕES
        </Text>

        <View style={styles.headerSpace} />
      </View>

      {/* Conta */}
      <Text
        style={[
          styles.sectionTitle,
          { color: cores.textoSecundario },
        ]}
      >
        Conta
      </Text>

      <Pressable
        style={[
          styles.menuItem,
          {
            backgroundColor: cores.card,
            borderColor: cores.borda,
          },
        ]}
      >
        <View style={styles.menuItemLeft}>
          <View
            style={[
              styles.menuIconContainer,
              { backgroundColor: cores.primariaSuave },
            ]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={cores.primariaTexto}
            />
          </View>

          <Text
            style={[
              styles.menuItemText,
              { color: cores.texto },
            ]}
          >
            Alterar senha
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={20}
          color={cores.textoSecundario}
        />
      </Pressable>

      {/* Notificações */}
      <Text
        style={[
          styles.sectionTitle,
          { color: cores.textoSecundario },
        ]}
      >
        Notificações
      </Text>

      <Setting
        texto="Receber notificações"
        icone="notifications-outline"
        valor={notificacoes}
        onChange={setNotificacoes}
        cores={cores}
      />

      <Setting
        texto="Próximos do vencimento"
        icone="time-outline"
        valor={vencimento}
        onChange={setVencimento}
        cores={cores}
      />

      <Setting
        texto="Alimentos vencidos"
        icone="warning-outline"
        valor={vencidos}
        onChange={setVencidos}
        cores={cores}
      />

      <Setting
        texto="Conquistas"
        icone="trophy-outline"
        valor={conquistas}
        onChange={setConquistas}
        cores={cores}
      />

      {/* Aparência */}
      <Text
        style={[
          styles.sectionTitle,
          { color: cores.textoSecundario },
        ]}
      >
        Aparência
      </Text>

      <Setting
        texto="Modo escuro"
        icone="moon-outline"
        valor={modoEscuro}
        onChange={alternarTema}
        cores={cores}
      />
    </ScrollView>
  );
}

function Setting({
  texto,
  icone,
  valor,
  onChange,
  cores,
}: {
  texto: string;
  icone: any;
  valor: boolean;
  onChange: (valor: boolean) => void;
  cores: CoresTema;
}) {
  return (
    <View
      style={[
        styles.settingItem,
        {
          backgroundColor: cores.card,
          borderColor: cores.borda,
        },
      ]}
    >
      <View style={styles.menuItemLeft}>
        <View
          style={[
            styles.menuIconContainer,
            { backgroundColor: cores.primariaSuave },
          ]}
        >
          <Ionicons
            name={icone}
            size={20}
            color={cores.primariaTexto}
          />
        </View>

        <Text
          style={[
            styles.menuItemText,
            { color: cores.texto },
          ]}
        >
          {texto}
        </Text>
      </View>

      <Switch
        value={valor}
        onValueChange={onChange}
        trackColor={{
          false: cores.borda,
          true: cores.primariaSuave,
        }}
        thumbColor={valor ? cores.primariaTexto : cores.card}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 20,
    paddingBottom: 20,
  },

  backButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  headerSpace: {
    width: 32,
  },

  title: {
    fontSize: 22,
    fontWeight: "900",
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 10,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },

  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },

  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  menuIconContainer: {
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },

  menuItemText: {
    fontSize: 15,
    fontWeight: "600",
  },
});