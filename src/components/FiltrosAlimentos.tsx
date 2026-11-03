import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useTheme } from "../context/ThemeContext";
import { FiltroSituacao, Ordem } from "../hooks/useListaAlimentos";

interface Props {
  visivel: boolean;
  onFechar: () => void;
  onLimpar: () => void;

  situacao: FiltroSituacao;
  onSituacao: (v: FiltroSituacao) => void;
  contagens: Record<FiltroSituacao, number>;

  categorias: string[];
  categoria: string | null;
  onCategoria: (v: string | null) => void;

  ordem: Ordem;
  onOrdem: (v: Ordem) => void;
}

const SITUACOES: { valor: FiltroSituacao; rotulo: string }[] = [
  { valor: "todos", rotulo: "Todos" },
  { valor: "vencidos", rotulo: "Vencidos" },
  { valor: "hoje", rotulo: "Vencem hoje" },
  { valor: "proximos", rotulo: "Próximos a vencer" },
  { valor: "longe", rotulo: "Longe do prazo" },
];

const ORDENS: { valor: Ordem; rotulo: string }[] = [
  { valor: "vencimento_asc", rotulo: "Mais vencido primeiro" },
  { valor: "vencimento_desc", rotulo: "Mais distante primeiro" },
];

export default function FiltrosAlimentos(p: Props) {
  const { cores } = useTheme();

  return (
    <Modal
      visible={p.visivel}
      transparent
      animationType="slide"
      onRequestClose={p.onFechar}
    >
      <Pressable
        style={[styles.fundo, { backgroundColor: cores.overlay }]}
        onPress={p.onFechar}
      />

      <View style={[styles.sheet, { backgroundColor: cores.fundo }]}>
        <View style={styles.cabecalho}>
          <Text style={[styles.titulo, { color: cores.texto }]}>Filtros</Text>
          <Pressable onPress={p.onLimpar} hitSlop={8}>
            <Text style={[styles.limpar, { color: cores.primariaTexto }]}>
              Limpar
            </Text>
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* SITUAÇÃO */}
          <Text style={[styles.secao, { color: cores.textoSecundario }]}>
            Situação da validade
          </Text>
          <View style={styles.chips}>
            {SITUACOES.map((s) => (
              <Chip
                key={s.valor}
                rotulo={`${s.rotulo} (${p.contagens[s.valor]})`}
                ativo={p.situacao === s.valor}
                onPress={() => p.onSituacao(s.valor)}
              />
            ))}
          </View>

          {/* CATEGORIA */}
          <Text style={[styles.secao, { color: cores.textoSecundario }]}>
            Categoria
          </Text>
          <View style={styles.chips}>
            <Chip
              rotulo="Todas"
              ativo={p.categoria === null}
              onPress={() => p.onCategoria(null)}
            />
            {p.categorias.map((c) => (
              <Chip
                key={c}
                rotulo={c}
                ativo={p.categoria === c}
                onPress={() => p.onCategoria(c)}
              />
            ))}
          </View>

          {/* ORDEM */}
          <Text style={[styles.secao, { color: cores.textoSecundario }]}>
            Ordenar por
          </Text>
          <View style={styles.chips}>
            {ORDENS.map((o) => (
              <Chip
                key={o.valor}
                rotulo={o.rotulo}
                ativo={p.ordem === o.valor}
                onPress={() => p.onOrdem(o.valor)}
              />
            ))}
          </View>
        </ScrollView>

        <Pressable
          style={[styles.botaoAplicar, { backgroundColor: cores.primaria }]}
          onPress={p.onFechar}
        >
          <Ionicons name="checkmark" size={18} color="#FFFFFF" />
          <Text style={styles.textoAplicar}>Aplicar</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

function Chip({
  rotulo,
  ativo,
  onPress,
}: {
  rotulo: string;
  ativo: boolean;
  onPress: () => void;
}) {
  const { cores } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        { backgroundColor: cores.card, borderColor: cores.borda },
        ativo && { backgroundColor: cores.primaria, borderColor: cores.primaria },
      ]}
    >
      <Text
        style={[
          styles.chipTexto,
          { color: cores.textoSecundario },
          ativo && styles.chipTextoAtivo,
        ]}
      >
        {rotulo}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheet: {
    backgroundColor: "#F8F7F1",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: 24,
    maxHeight: "80%",
  },
  cabecalho: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  titulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#26332D",
  },
  limpar: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#43855F",
  },
  secao: {
    fontSize: 12,
    fontWeight: "700",
    color: "#46534D",
    marginTop: 16,
    marginBottom: 8,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D8D8D8",
  },
  chipAtivo: {
    backgroundColor: "#43855F",
    borderColor: "#43855F",
  },
  chipTexto: {
    fontSize: 12,
    color: "#46534D",
  },
  chipTextoAtivo: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  botaoAplicar: {
    height: 42,
    backgroundColor: "#43855F",
    borderRadius: 22,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
    gap: 6,
  },
  textoAplicar: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },
});
