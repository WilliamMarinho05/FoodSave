import BarraExp from "@/src/components/BarraExp";
import { useTheme } from "@/src/context/ThemeContext";
import { supabase } from "@/src/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type DadosUsuario = {
  nome: string;
  sobrenome: string;
  dataNascimento: string;
  email: string;
  emailConfirmado: boolean;
  membroDesde: string;
  ultimoAcesso: string;
};

const NAO_INFORMADO = "Não informado";

// "2000-05-23" -> "23/05/2000" (sem passar por Date, evita erro de fuso)
function formatarDataISO(data?: string | null) {
  if (!data) return NAO_INFORMADO;

  const [ano, mes, dia] = data.split("T")[0].split("-");
  if (!ano || !mes || !dia) return NAO_INFORMADO;

  return `${dia}/${mes}/${ano}`;
}

// Timestamp ISO (UTC) -> data local DD/MM/AAAA
function formatarTimestamp(valor?: string | null, comHora = false) {
  if (!valor) return NAO_INFORMADO;

  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return NAO_INFORMADO;

  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const data = `${dd}/${mm}/${d.getFullYear()}`;

  if (!comHora) return data;

  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${data} às ${hh}:${min}`;
}

function iniciais(nome: string, sobrenome: string) {
  const a = nome.trim().charAt(0);
  const b = sobrenome.trim().charAt(0);
  return (a + b).toUpperCase() || "?";
}

export default function DadosPessoais() {
  const router = useRouter();
  const { cores } = useTheme();

  const [dados, setDados] = useState<DadosUsuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      async function carregar() {
        setCarregando(true);
        setErro(false);

        try {
          const {
            data: { user },
            error,
          } = await supabase.auth.getUser();

          if (error || !user) {
            if (ativo) setDados(null);
            return;
          }

          const meta = user.user_metadata ?? {};
          let nome: string = meta.nome ?? "";

          // Fallback: contas sem metadata usam o nome da tabela perfis (igual à Home)
          if (!nome) {
            const { data: perfil } = await supabase
              .from("perfis")
              .select("nome")
              .eq("id", user.id)
              .maybeSingle();

            nome = perfil?.nome ?? "";
          }

          if (!ativo) return;

          setDados({
            nome,
            sobrenome: meta.sobrenome ?? "",
            dataNascimento: formatarDataISO(meta.data_nascimento),
            email: user.email ?? NAO_INFORMADO,
            emailConfirmado: !!user.email_confirmed_at,
            membroDesde: formatarTimestamp(user.created_at),
            ultimoAcesso: formatarTimestamp(user.last_sign_in_at, true),
          });
        } catch (e) {
          console.error("Erro ao carregar dados do usuário:", e);
          if (ativo) setErro(true);
        } finally {
          if (ativo) setCarregando(false);
        }
      }

      carregar();

      return () => {
        ativo = false;
      };
    }, [])
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: cores.fundo }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >

      <Pressable style={styles.voltar} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={cores.primariaTexto} />
        <Text style={[styles.voltarTexto, { color: cores.primariaTexto }]}>
          Voltar
        </Text>
      </Pressable>

      <Text style={[styles.titulo, { color: cores.primariaTexto }]}>
        Dados Pessoais
      </Text>
      <Text style={[styles.subtitulo, { color: cores.textoSecundario }]}>
        Confira as informações da conta conectada no momento.
      </Text>

      {carregando ? (
        <View style={styles.centralizado}>
          <ActivityIndicator size="large" color={cores.primariaTexto} />
          <Text style={[styles.mensagem, { color: cores.textoSecundario }]}>
            Carregando seus dados...
          </Text>
        </View>
      ) : erro || !dados ? (
        <View style={styles.centralizado}>
          <Ionicons
            name="alert-circle-outline"
            size={40}
            color={cores.textoFraco}
          />
          <Text style={[styles.mensagemTitulo, { color: cores.texto }]}>
            {erro
              ? "Não foi possível carregar seus dados"
              : "Nenhum usuário conectado"}
          </Text>
          <Text style={[styles.mensagem, { color: cores.textoSecundario }]}>
            {erro
              ? "Verifique sua conexão e tente novamente."
              : "Faça login para visualizar seus dados."}
          </Text>
        </View>
      ) : (
        <>
          {/* AVATAR + NOME */}
          <View style={styles.resumo}>
            <View style={[styles.avatarBorda, { borderColor: cores.primaria }]}>
              <View style={[styles.avatar, { backgroundColor: cores.primariaSuave }]}>
                <Text style={[styles.avatarTexto, { color: cores.primariaTexto }]}>
                  {iniciais(dados.nome, dados.sobrenome)}
                </Text>
              </View>
            </View>

            <Text style={[styles.nomeCompleto, { color: cores.texto }]}>
              {`${dados.nome} ${dados.sobrenome}`.trim() || NAO_INFORMADO}
            </Text>
            <Text style={[styles.emailResumo, { color: cores.textoSecundario }]}>
              {dados.email}
            </Text>
          </View>

          {/* NÍVEL / XP (reaproveita o componente existente) */}
          <BarraExp />

          {/* INFORMAÇÕES PESSOAIS */}
          <Text style={[styles.secao, { color: cores.texto }]}>
            Informações pessoais
          </Text>
          <View style={[styles.cardLista, { backgroundColor: cores.card }]}>
            <LinhaInfo
              icone="person-outline"
              rotulo="Nome"
              valor={dados.nome || NAO_INFORMADO}
            />
            <LinhaInfo
              icone="people-outline"
              rotulo="Sobrenome"
              valor={dados.sobrenome || NAO_INFORMADO}
            />
            <LinhaInfo
              icone="gift-outline"
              rotulo="Data de nascimento"
              valor={dados.dataNascimento}
            />
            <LinhaInfo
              icone="mail-outline"
              rotulo="E-mail"
              valor={dados.email}
              ultimo
            />
          </View>

          {/* CONTA */}
          <Text style={[styles.secao, { color: cores.texto }]}>Conta</Text>
          <View style={[styles.cardLista, { backgroundColor: cores.card }]}>
            <LinhaInfo
              icone="shield-checkmark-outline"
              rotulo="E-mail verificado"
              valor={dados.emailConfirmado ? "Sim" : "Não"}
              corValor={
                dados.emailConfirmado ? cores.sucesso : cores.atencao
              }
            />
            <LinhaInfo
              icone="calendar-outline"
              rotulo="Membro desde"
              valor={dados.membroDesde}
            />
            <LinhaInfo
              icone="time-outline"
              rotulo="Último acesso"
              valor={dados.ultimoAcesso}
              ultimo
            />
          </View>
        </>
      )}
    </ScrollView>
  );
}

function LinhaInfo({
  icone,
  rotulo,
  valor,
  ultimo,
  corValor,
}: {
  icone: React.ComponentProps<typeof Ionicons>["name"];
  rotulo: string;
  valor: string;
  ultimo?: boolean;
  corValor?: string;
}) {
  const { cores } = useTheme();

  return (
    <View
      style={[
        styles.linha,
        !ultimo && [styles.linhaDivisor, { borderBottomColor: cores.bordaSuave }],
      ]}
    >
      <View style={[styles.iconeContainer, { backgroundColor: cores.primariaSuave }]}>
        <Ionicons name={icone} size={18} color={cores.primariaTexto} />
      </View>

      <View style={styles.linhaTextos}>
        <Text style={[styles.rotulo, { color: cores.textoSecundario }]}>
          {rotulo}
        </Text>
        <Text
          style={[styles.valor, { color: cores.texto }, corValor ? { color: corValor } : null]}
          selectable
        >
          {valor}
        </Text>
      </View>
    </View>
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
    marginBottom: 25,
  },
  voltarTexto: {
    fontSize: 16,
    color: "#43855F",
    fontWeight: "600",
    marginLeft: 6,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "900",
    color: "#43855F",
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 15,
    color: "#666",
    marginBottom: 25,
    lineHeight: 21,
  },

  centralizado: {
    alignItems: "center",
    paddingVertical: 50,
  },
  mensagemTitulo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
    textAlign: "center",
  },
  mensagem: {
    fontSize: 13,
    color: "#8C9AA0",
    textAlign: "center",
    marginTop: 8,
  },

  resumo: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarBorda: {
    padding: 3,
    borderWidth: 2,
    borderColor: "#43855F",
    borderRadius: 60,
    marginBottom: 12,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#EAF2EC",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarTexto: {
    fontSize: 32,
    fontWeight: "900",
    color: "#43855F",
  },
  nomeCompleto: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
  },
  emailResumo: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },

  secao: {
    fontSize: 18,
    fontWeight: "800",
    color: "#333",
    marginTop: 10,
    marginBottom: 10,
  },
  cardLista: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 14,
  },
  linha: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  linhaDivisor: {
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  iconeContainer: {
    backgroundColor: "#EAF2EC",
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  linhaTextos: {
    flex: 1,
  },
  rotulo: {
    fontSize: 12,
    color: "#8C9AA0",
    marginBottom: 2,
  },
  valor: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
});
