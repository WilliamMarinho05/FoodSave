import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { useTheme } from "../../src/context/ThemeContext";
import { buscarProgressoMissoes } from "../../src/services/missoes";

export default function Missoes() {
  const { cores } = useTheme();
  const [progressoCadastro, setProgressoCadastro] = useState(0);
  const [progressoValidade, setProgressoValidade] = useState(0);
  const [progressoCadastroSemanal, setProgressoCadastroSemanal] = useState(0);

  useFocusEffect(
    useCallback(() => {
      async function carregarProgresso() {
        const progresso = await buscarProgressoMissoes();

        setProgressoCadastro(progresso.cadastrarAlimentos);
        setProgressoValidade(progresso.verificarValidade);
        setProgressoCadastroSemanal(progresso.cadastrarAlimentosSemanal);
      }

      carregarProgresso();
    }, [])
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: cores.fundo }]}
      contentContainerStyle={styles.conteudo}
    >
      <Text style={[styles.titulo, { color: cores.texto }]}>🎯 Missões Diárias</Text>

      <Text style={[styles.subtitulo, { color: cores.textoSecundario }]}>
        Complete suas missões de hoje!
      </Text>

      {/* Missão diária 1 */}
      <View
        style={[
          styles.card,
          { backgroundColor: cores.card, borderColor: cores.borda },
        ]}
      >
        <Text style={[styles.missaoTitulo, { color: cores.texto }]}>
          🥕 Cadastrar alimentos
        </Text>

        <Text style={[styles.descricao, { color: cores.textoSecundario }]}>
          Cadastre 2 alimentos hoje.
        </Text>

        <Text style={[styles.progresso, { color: cores.texto }]}>
          {progressoCadastro}/2
        </Text>

        <View style={[styles.barraFundo, { backgroundColor: cores.borda }]}>
          <View
            style={[
              styles.barraProgresso,
              {
                width: `${Math.min((progressoCadastro / 2) * 100, 100)}%`,
                backgroundColor: cores.primaria,
              },
            ]}
          />
        </View>

        {progressoCadastro >= 2 && (
          <Text style={[styles.concluida, { color: cores.sucesso }]}>
            ✓ Missão concluída!
          </Text>
        )}

        <Text style={[styles.recompensa, { color: cores.texto }]}>
          ⭐ +20 pontos
        </Text>
      </View>

      {/* Missão diária 2 */}
      <View
        style={[
          styles.card,
          { backgroundColor: cores.card, borderColor: cores.borda },
        ]}
      >
        <Text style={[styles.missaoTitulo, { color: cores.texto }]}>
          ⚠️ Verificar validade
        </Text>

        <Text style={[styles.descricao, { color: cores.textoSecundario }]}>
          Confira seus alimentos próximos do vencimento.
        </Text>

        <Text style={[styles.progresso, { color: cores.texto }]}>
          {progressoValidade}/1
        </Text>

        <View style={[styles.barraFundo, { backgroundColor: cores.borda }]}>
          <View
            style={[
              styles.barraProgresso,
              {
                width: `${Math.min((progressoValidade / 1) * 100, 100)}%`,
                backgroundColor: cores.primaria,
              },
            ]}
          />
        </View>

        {progressoValidade >= 1 && (
          <Text style={[styles.concluida, { color: cores.sucesso }]}>
            ✓ Missão concluída!
          </Text>
        )}

        <Text style={[styles.recompensa, { color: cores.texto }]}>
          ⭐ +30 pontos
        </Text>
      </View>

      {/* Seção de missões semanais */}
      <Text style={[styles.tituloSecao, { color: cores.texto }]}>
        📅 Missões Semanais
      </Text>

      <Text style={[styles.subtitulo, { color: cores.textoSecundario }]}>
        Complete objetivos ao longo da semana!
      </Text>

      {/* Missão semanal 1 */}
      <View
        style={[
          styles.card,
          { backgroundColor: cores.card, borderColor: cores.borda },
        ]}
      >
        <Text style={[styles.missaoTitulo, { color: cores.texto }]}>
          🏆 Organizador semanal
        </Text>

        <Text style={[styles.descricao, { color: cores.textoSecundario }]}>
          Cadastre 5 alimentos durante a semana.
        </Text>

        <Text style={[styles.progresso, { color: cores.texto }]}>
          {progressoCadastroSemanal}/5
        </Text>

        <View style={[styles.barraFundo, { backgroundColor: cores.borda }]}>
          <View
            style={[
              styles.barraProgresso,
              {
                width: `${Math.min((progressoCadastroSemanal / 5) * 100, 100)}%`,
                backgroundColor: cores.primaria,
              },
            ]}
          />
        </View>

        {progressoCadastroSemanal >= 5 && (
          <Text style={[styles.concluida, { color: cores.sucesso }]}>
            ✓ Missão semanal concluída!
          </Text>
        )}

        <Text style={[styles.recompensa, { color: cores.texto }]}>
          ⭐ +50 pontos
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  conteudo: { padding: 20, paddingBottom: 35 },
  titulo: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  tituloSecao: { fontSize: 22, fontWeight: "bold", marginTop: 10, marginBottom: 10 },
  subtitulo: { fontSize: 16, color: "#666", marginBottom: 25 },
  card: { backgroundColor: "#f8f8f8", borderRadius: 12, padding: 18, marginBottom: 18, borderWidth: 1, borderColor: "#e0e0e0" },
  missaoTitulo: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  descricao: { fontSize: 15, color: "#555", marginBottom: 15 },
  progresso: { fontSize: 14, fontWeight: "bold", marginBottom: 6 },
  barraFundo: { height: 10, backgroundColor: "#ddd", borderRadius: 5, overflow: "hidden", marginBottom: 12 },
  barraProgresso: { height: "100%", backgroundColor: "#65B32E" },
  recompensa: { fontSize: 14, fontWeight: "bold" },
  concluida: { fontSize: 14, fontWeight: "bold", color: "#43855F", marginBottom: 8 },
});