
import { useCallback, useState } from "react";
import {ActivityIndicator,FlatList,StyleSheet,Text,View,} from "react-native";
import { useFocusEffect } from "expo-router";
import {AlimentoBanco,buscarAlimentosEmEstoque,} from "../../../src/services/alimentos";

type Alerta = {
  titulo: string;
  alimentos: AlimentoBanco[];
  cor: string;
};

function obterDataLocal(data: Date) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function converterValidade(data: string) {
  const partes = data.split("/");

  if (partes.length !== 3) {
    return "";
  }

  const [dia, mes, ano] = partes;
  return `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
}

function calcularDiasAteValidade(validade: string) {
  const dataValidade = converterValidade(validade);

  if (!dataValidade) {
    return null;
  }

  const hoje = obterDataLocal(new Date());
  const inicioHoje = new Date(`${hoje}T00:00:00`);
  const dataAlimento = new Date(`${dataValidade}T00:00:00`);

  if (Number.isNaN(dataAlimento.getTime())) {
    return null;
  }

  return Math.round(
    (dataAlimento.getTime() - inicioHoje.getTime()) /
      (1000 * 60 * 60 * 24)
  );
}

export default function Alertas() {
  const [alimentos, setAlimentos] = useState<AlimentoBanco[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  const carregarAlimentos = useCallback(async () => {
    setCarregando(true);
    setErro(false);

    try {
      const dados = await buscarAlimentosEmEstoque();
      setAlimentos(dados);
    } catch (error) {
      console.error("Erro ao carregar alertas:", error);
      setErro(true);
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarAlimentos();
    }, [carregarAlimentos])
  );

  const vencidos = alimentos.filter(
    (item) => calcularDiasAteValidade(item.validade) !== null &&
      calcularDiasAteValidade(item.validade)! < 0
  );

  const vencemHoje = alimentos.filter(
    (item) => calcularDiasAteValidade(item.validade) === 0
  );

  const vencemEmBreve = alimentos.filter((item) => {
    const dias = calcularDiasAteValidade(item.validade);
    return dias !== null && dias > 0 && dias <= 3;
  });

  const alertas: Alerta[] = [
    { titulo: "Vencidos", alimentos: vencidos, cor: "#C62828" },
    { titulo: "Vencem hoje", alimentos: vencemHoje, cor: "#E67E22" },
    { titulo: "Vencem em até 3 dias", alimentos: vencemEmBreve, cor: "#B8860B" },
  ];

  if (carregando) {
    return (
      <View style={styles.centralizado}>
        <ActivityIndicator size="large" color="#43855F" />
        <Text style={styles.mensagem}>Carregando alertas...</Text>
      </View>
    );
  }

  if (erro) {
    return (
      <View style={styles.centralizado}>
        <Text style={styles.mensagem}>
          Não foi possível carregar os alertas.
        </Text>
      </View>
    );
  }

  const totalAlertas =
    vencidos.length + vencemHoje.length + vencemEmBreve.length;

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.conteudo}
      data={alertas}
      keyExtractor={(item) => item.titulo}
      ListHeaderComponent={
        <View>
          <Text style={styles.titulo}>Alertas</Text>
          <Text style={styles.subtitulo}>
            Acompanhe os alimentos que precisam da sua atenção.
          </Text>

          <View style={styles.resumo}>
            <Text style={styles.numero}>{totalAlertas}</Text>
            <Text style={styles.resumoTexto}>
              {totalAlertas === 1
                ? "alimento precisa de atenção"
                : "alimentos precisam de atenção"}
            </Text>
          </View>

          {totalAlertas === 0 && (
            <View style={styles.vazio}>
              <Text style={styles.vazioTitulo}>Tudo em dia!</Text>
              <Text style={styles.mensagem}>
                Não há alimentos vencidos ou próximos do vencimento.
              </Text>
            </View>
          )}
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.grupo}>
          <Text style={[styles.tituloGrupo, { color: item.cor }]}>
            {item.titulo} ({item.alimentos.length})
          </Text>

          {item.alimentos.length === 0 ? (
            <Text style={styles.semItens}>
              Nenhum alimento nesta categoria.
            </Text>
          ) : (
            item.alimentos.map((alimento) => (
              <View key={alimento.id} style={styles.card}>
                <Text style={styles.nome}>{alimento.nome}</Text>
                <Text style={styles.detalhe}>
                  Validade: {alimento.validade || "Não informada"}
                </Text>
                <Text style={styles.detalhe}>
                  Quantidade: {alimento.quantidade} {alimento.unidade}
                </Text>
              </View>
            ))
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F7F1",
  },
  conteudo: {
    padding: 16,
    paddingBottom: 30,
  },
  centralizado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#F8F7F1",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#26332D",
  },
  subtitulo: {
    fontSize: 14,
    color: "#65736B",
    marginTop: 6,
    marginBottom: 16,
  },
  resumo: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EAF2EC",
  },
  numero: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#43855F",
  },
  resumoTexto: {
    color: "#65736B",
    marginTop: 4,
  },
  grupo: {
    marginBottom: 22,
  },
  tituloGrupo: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#EAF2EC",
  },
  nome: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#26332D",
    marginBottom: 6,
  },
  detalhe: {
    fontSize: 13,
    color: "#65736B",
    marginTop: 3,
  },
  semItens: {
    fontSize: 13,
    color: "#65736B",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 8,
  },
  vazio: {
    alignItems: "center",
    padding: 20,
    marginBottom: 20,
    backgroundColor: "#EAF4E9",
    borderRadius: 12,
  },
  vazioTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#287A43",
    marginBottom: 6,
  },
  mensagem: {
    fontSize: 14,
    color: "#65736B",
    textAlign: "center",
    marginTop: 8,
  },
});