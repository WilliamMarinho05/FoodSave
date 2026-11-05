import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

import {
  DIAS_SEMANA,
  MESES,
  diaSemanaDoPrimeiro,
  diasNoMes,
  hojeISO,
  paraISO,
  partesISO,
} from "../utils/datas";

type Props = {
  visivel: boolean;
  titulo: string;
  valor: string; // AAAA-MM-DD ou ""
  minData?: string; // datas antes desta mostram mensagemMinima
  maxData?: string; // datas depois desta mostram mensagemMaxima
  mensagemMinima?: string;
  mensagemMaxima?: string;
  aoSelecionar: (iso: string) => void;
  aoFechar: () => void;
};

export default function CalendarioModal({
  visivel,
  titulo,
  valor,
  minData,
  maxData,
  mensagemMinima,
  mensagemMaxima,
  aoSelecionar,
  aoFechar,
}: Props) {
  const { cores } = useTheme();
  const hoje = hojeISO();

  const [ano, setAno] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth());
  const [aviso, setAviso] = useState("");

  // Ao abrir, posiciona no mês do valor atual (ou no mais útil para escolher)
  useEffect(() => {
    if (!visivel) return;

    const base =
      valor || minData || (maxData && maxData < hoje ? maxData : hoje);
    const partes = partesISO(base);

    setAno(partes.ano);
    setMes(partes.mes);
    setAviso("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visivel]);

  const indiceMes = ano * 12 + mes;
  const podeVoltar =
    !minData ||
    indiceMes > partesISO(minData).ano * 12 + partesISO(minData).mes;
  const podeAvancar =
    !maxData ||
    indiceMes < partesISO(maxData).ano * 12 + partesISO(maxData).mes;

  const mudarMes = (delta: number) => {
    const novo = ano * 12 + mes + delta;
    setAno(Math.floor(novo / 12));
    setMes(novo % 12);
    setAviso("");
  };

  const escolherDia = (iso: string) => {
    if (minData && iso < minData) {
      setAviso(mensagemMinima ?? "Data indisponível.");
      return;
    }

    if (maxData && iso > maxData) {
      setAviso(mensagemMaxima ?? "Data indisponível.");
      return;
    }

    setAviso("");
    aoSelecionar(iso);
  };

  const vazios = diaSemanaDoPrimeiro(ano, mes);
  const total = diasNoMes(ano, mes);

  const celulas: (number | null)[] = [
    ...Array(vazios).fill(null),
    ...Array.from({ length: total }, (_, i) => i + 1),
  ];

  return (
    <Modal
      visible={visivel}
      transparent
      animationType="fade"
      onRequestClose={aoFechar}
    >
      <View style={[styles.overlay, { backgroundColor: cores.overlay }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={aoFechar} />

        <View style={[styles.card, { backgroundColor: cores.card, shadowColor: cores.sombra }]}>
          <View style={styles.topo}>
            <Text style={[styles.titulo, { color: cores.texto }]}>{titulo}</Text>

            <Pressable onPress={aoFechar} hitSlop={10}>
              <Ionicons name="close" size={22} color={cores.textoSecundario} />
            </Pressable>
          </View>

          <View style={[styles.navegacao, { backgroundColor: cores.primariaSuave }]}>
            <Pressable
              style={[
                styles.setaMes,
                { backgroundColor: cores.card },
                !podeVoltar && styles.setaDesabilitada,
              ]}
              onPress={() => podeVoltar && mudarMes(-1)}
              disabled={!podeVoltar}
            >
              <Ionicons name="chevron-back" size={20} color={cores.primariaTexto} />
            </Pressable>

            <Text style={[styles.mesAno, { color: cores.texto }]}>
              {MESES[mes]} {ano}
            </Text>

            <Pressable
              style={[
                styles.setaMes,
                { backgroundColor: cores.card },
                !podeAvancar && styles.setaDesabilitada,
              ]}
              onPress={() => podeAvancar && mudarMes(1)}
              disabled={!podeAvancar}
            >
              <Ionicons name="chevron-forward" size={20} color={cores.primariaTexto} />
            </Pressable>
          </View>

          <View style={styles.semana}>
            {DIAS_SEMANA.map((d, i) => (
              <Text key={i} style={[styles.diaSemana, { color: cores.textoSecundario }]}>
                {d}
              </Text>
            ))}
          </View>

          <View style={styles.grade}>
            {celulas.map((dia, i) => {
              if (dia === null) {
                return <View key={`v${i}`} style={styles.celula} />;
              }

              const iso = paraISO(ano, mes, dia);
              const selecionado = iso === valor;
              const eHoje = iso === hoje;
              const foraDoLimite =
                (!!minData && iso < minData) || (!!maxData && iso > maxData);

              return (
                <Pressable
                  key={iso}
                  style={styles.celula}
                  onPress={() => escolherDia(iso)}
                >
                  <View
                    style={[
                      styles.dia,
                      eHoje && [styles.diaHoje, { borderColor: cores.primaria }],
                      selecionado && [
                        styles.diaSelecionado,
                        { backgroundColor: cores.primaria },
                      ],
                    ]}
                  >
                    <Text
                      style={[
                        styles.diaTexto,
                        { color: cores.texto },
                        foraDoLimite && { color: cores.textoFraco, opacity: 0.5 },
                        selecionado && styles.diaTextoSelecionado,
                      ]}
                    >
                      {dia}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {!!aviso && (
            <View style={[styles.aviso, { backgroundColor: cores.perigoSuave }]}>
              <Ionicons name="alert-circle" size={18} color={cores.perigo} />
              <Text style={[styles.avisoTexto, { color: cores.perigo }]}>
                {aviso}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(38, 51, 45, 0.45)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },

  topo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  titulo: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#26332D",
  },

  navegacao: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#EAF2EC",
    borderRadius: 14,
    paddingHorizontal: 6,
    paddingVertical: 6,
    marginBottom: 10,
  },

  setaMes: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  setaDesabilitada: {
    opacity: 0.35,
  },

  mesAno: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#26332D",
  },

  semana: {
    flexDirection: "row",
    marginBottom: 4,
  },

  diaSemana: {
    flex: 1,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "600",
    color: "#8C9AA0",
  },

  grade: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  celula: {
    width: `${100 / 7}%`,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
  },

  dia: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  diaHoje: {
    borderWidth: 1,
    borderColor: "#43855F",
  },

  diaSelecionado: {
    backgroundColor: "#43855F",
    borderWidth: 0,
  },

  diaTexto: {
    fontSize: 13,
    color: "#26332D",
  },

  diaTextoDesabilitado: {
    color: "#C4CAC7",
  },

  diaTextoSelecionado: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  aviso: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FDECEA",
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },

  avisoTexto: {
    flex: 1,
    fontSize: 12,
    color: "#C0392B",
  },
});
