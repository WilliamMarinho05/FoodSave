import { useTheme } from "@/src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { Stack, useRouter } from "expo-router";
import React from "react";
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// ---------------------------------------------------------------
// Textos da página (edite aqui sem mexer no layout)
// ---------------------------------------------------------------
const SLOGAN = "Organize sua cozinha, evite desperdícios.";

const APRESENTACAO =
  "O FoodSave ajuda você a controlar a validade dos alimentos que tem em casa, avisando o que precisa ser consumido primeiro para que menos comida vá para o lixo.";

const MISSAO =
  "Reduzir o desperdício de alimentos no dia a dia, transformando o cuidado com a despensa em um hábito simples, organizado e até divertido.";

const EMAIL_SUPORTE = "suporte@foodsave.com";

const recursos = [
  {
    titulo: "Controle de validade",
    descricao:
      "Cadastre seus alimentos e acompanhe o que está no prazo, perto de vencer ou já vencido.",
    icone: "calendar-outline" as const,
  },
  {
    titulo: "Alertas",
    descricao:
      "Saiba o que precisa ser consumido antes que estrague.",
    icone: "notifications-outline" as const,
  },
  {
    titulo: "Missões e níveis",
    descricao:
      "Complete missões, ganhe XP e suba de nível a cada conquista.",
    icone: "flag-outline" as const,
  },
  {
    titulo: "Troféus",
    descricao:
      "Desbloqueie conquistas conforme usa o aplicativo.",
    icone: "trophy-outline" as const,
  },
  {
    titulo: "Histórico",
    descricao:
      "Veja o que você já consumiu e acompanhe seu progresso contra o desperdício.",
    icone: "time-outline" as const,
  },
];

export default function SobreOApp() {
  const router = useRouter();
  const { cores } = useTheme();
  const versao = Constants.expoConfig?.version ?? "1.0.0";

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: cores.fundo }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Stack.Screen options={{ title: "Sobre o App" }} />

      <Pressable style={styles.voltar} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={cores.primariaTexto} />
        <Text style={[styles.voltarTexto, { color: cores.primariaTexto }]}>
          Voltar
        </Text>
      </Pressable>

      {/* APRESENTAÇÃO / PROMOÇÃO */}
      <View
        style={[
          styles.hero,
          {
            backgroundColor: cores.card,
            borderColor: cores.borda,
            shadowColor: cores.sombra,
          },
        ]}
      >
        <View style={[styles.logoBorda, { borderColor: cores.primaria }]}>
          <Image
            source={require("../../assets/images/logo.jpeg")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={[styles.nomeApp, { color: cores.primariaTexto }]}>
          FoodSave
        </Text>
        <Text style={[styles.slogan, { color: cores.textoSecundario }]}>
          {SLOGAN}
        </Text>

        <View style={[styles.versaoPill, { backgroundColor: cores.primariaSuave }]}>
          <Text style={[styles.versaoTexto, { color: cores.primariaTexto }]}>
            Versão {versao}
          </Text>
        </View>
      </View>

      {/* O QUE É */}
      <Text style={[styles.secao, { color: cores.texto }]}>
        O que é o FoodSave
      </Text>
      <View style={[styles.cardTexto, { backgroundColor: cores.card }]}>
        <Text style={[styles.paragrafo, { color: cores.textoSecundario }]}>
          {APRESENTACAO}
        </Text>
      </View>

      {/* MISSÃO */}
      <Text style={[styles.secao, { color: cores.texto }]}>Nossa missão</Text>
      <View style={[styles.cardTexto, { backgroundColor: cores.card }]}>
        <View style={styles.missaoLinha}>
          <View
            style={[styles.iconeContainer, { backgroundColor: cores.primariaSuave }]}
          >
            <Ionicons name="leaf-outline" size={22} color={cores.primariaTexto} />
          </View>
          <Text
            style={[
              styles.paragrafo,
              styles.missaoTexto,
              { color: cores.textoSecundario },
            ]}
          >
            {MISSAO}
          </Text>
        </View>
      </View>

      {/* RECURSOS */}
      <Text style={[styles.secao, { color: cores.texto }]}>
        O que você pode fazer
      </Text>
      <View style={styles.lista}>
        {recursos.map((r) => (
          <View
            key={r.titulo}
            style={[styles.cardRecurso, { backgroundColor: cores.card }]}
          >
            <View
              style={[styles.iconeContainer, { backgroundColor: cores.primariaSuave }]}
            >
              <Ionicons name={r.icone} size={22} color={cores.primariaTexto} />
            </View>

            <View style={styles.textos}>
              <Text style={[styles.cardTitulo, { color: cores.texto }]}>
                {r.titulo}
              </Text>
              <Text style={[styles.cardDescricao, { color: cores.textoSecundario }]}>
                {r.descricao}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* AJUDA / CONTATO */}
      <Text style={[styles.secao, { color: cores.texto }]}>
        Fale com a gente
      </Text>
      <View style={styles.lista}>
        <Pressable
          style={[styles.cardRecurso, { backgroundColor: cores.card }]}
          onPress={() => Linking.openURL(`mailto:${EMAIL_SUPORTE}`)}
        >
          <View
            style={[styles.iconeContainer, { backgroundColor: cores.primariaSuave }]}
          >
            <Ionicons name="mail-outline" size={22} color={cores.primariaTexto} />
          </View>
          <View style={styles.textos}>
            <Text style={[styles.cardTitulo, { color: cores.texto }]}>
              E-mail de suporte
            </Text>
            <Text style={[styles.cardDescricao, { color: cores.textoSecundario }]}>
              {EMAIL_SUPORTE}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={cores.textoFraco} />
        </Pressable>

        <Pressable
          style={[styles.cardRecurso, { backgroundColor: cores.card }]}
          onPress={() => router.push("/ajuda")}
        >
          <View
            style={[styles.iconeContainer, { backgroundColor: cores.primariaSuave }]}
          >
            <Ionicons
              name="help-circle-outline"
              size={22}
              color={cores.primariaTexto}
            />
          </View>
          <View style={styles.textos}>
            <Text style={[styles.cardTitulo, { color: cores.texto }]}>
              Ajuda e Suporte
            </Text>
            <Text style={[styles.cardDescricao, { color: cores.textoSecundario }]}>
              Dúvidas frequentes, tutoriais e mais.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={cores.textoFraco} />
        </Pressable>
      </View>

      <Text style={[styles.rodape, { color: cores.textoFraco }]}>
        © {new Date().getFullYear()} FoodSave. Todos os direitos reservados.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F6",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },

  voltar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  voltarTexto: {
    fontSize: 16,
    color: "#43855F",
    fontWeight: "600",
    marginLeft: 6,
  },

  hero: {
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#EAF2EC",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  logoBorda: {
    padding: 3,
    borderWidth: 2,
    borderColor: "#43855F",
    borderRadius: 60,
    marginBottom: 14,
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  nomeApp: {
    fontSize: 26,
    fontWeight: "900",
    color: "#43855F",
  },
  slogan: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 21,
    marginTop: 6,
  },
  versaoPill: {
    marginTop: 14,
    backgroundColor: "#EAF2EC",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  versaoTexto: {
    fontSize: 12,
    fontWeight: "700",
    color: "#43855F",
  },

  secao: {
    fontSize: 18,
    fontWeight: "800",
    color: "#333",
    marginTop: 26,
    marginBottom: 10,
  },

  cardTexto: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  paragrafo: {
    fontSize: 14,
    color: "#555",
    lineHeight: 21,
  },
  missaoLinha: {
    flexDirection: "row",
    alignItems: "center",
  },
  missaoTexto: {
    flex: 1,
  },

  lista: {
    gap: 10,
  },
  cardRecurso: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  iconeContainer: {
    backgroundColor: "#EAF2EC",
    padding: 10,
    borderRadius: 10,
    marginRight: 14,
  },
  textos: {
    flex: 1,
  },
  cardTitulo: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
    marginBottom: 3,
  },
  cardDescricao: {
    fontSize: 13,
    color: "#777",
    lineHeight: 18,
  },

  rodape: {
    marginTop: 30,
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
});
