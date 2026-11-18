import BotaoVoltar from "@/src/components/BotaoVoltar";
import { useTheme } from "@/src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { type CoresTema } from "@/src/context/ThemeContext";
import { supabase } from "../../src/lib/supabase";
import { mostrarAlerta, traduzirErroAuth } from "../../src/utils/mensagens";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Campo =
  | "nome"
  | "sobrenome"
  | "dataNascimento"
  | "email"
  | "senha"
  | "confirmacaoSenha";

type Erros = Partial<Record<Campo, string>>;

// ---------- Validações ----------

function validarNome(valor: string, rotulo: string) {
  const limpo = valor.trim();

  if (!limpo) return `Informe seu ${rotulo}.`;
  if (limpo.length < 2) return `O ${rotulo} deve ter pelo menos 2 letras.`;

  return "";
}

function validarEmail(valor: string) {
  const limpo = valor.trim();

  if (!limpo) return "Informe seu e-mail.";
  if (!EMAIL_REGEX.test(limpo)) return "Digite um e-mail válido.";

  return "";
}

function validarDataNascimento(valor: string) {
  if (!valor) return "Informe sua data de nascimento.";

  const partes = valor.split("/");

  if (
    partes.length !== 3 ||
    partes[0].length !== 2 ||
    partes[1].length !== 2 ||
    partes[2].length !== 4
  ) {
    return "Use o formato DD/MM/AAAA.";
  }

  const dia = Number(partes[0]);
  const mes = Number(partes[1]);
  const ano = Number(partes[2]);

  const data = new Date(Date.UTC(ano, mes - 1, dia));

  if (
    data.getUTCFullYear() !== ano ||
    data.getUTCMonth() !== mes - 1 ||
    data.getUTCDate() !== dia
  ) {
    return "Digite uma data de nascimento válida.";
  }

  const hoje = new Date();
  const hojeUTC = Date.UTC(
    hoje.getFullYear(),
    hoje.getMonth(),
    hoje.getDate()
  );

  if (data.getTime() > hojeUTC) {
    return "A data de nascimento não pode ser no futuro.";
  }

  if (ano < 1900) {
    return "Digite uma data de nascimento válida.";
  }

  return "";
}

function validarSenha(valor: string) {
  if (!valor) return "Crie uma senha.";
  if (valor.length < 6) return "A senha deve ter pelo menos 6 caracteres.";

  return "";
}

// ---------- Campos reutilizáveis ----------

type PropsCampoTexto = {
  label: string;
  valor: string;
  aoMudar: (texto: string) => void;
  placeholder: string;
  erro?: string;
  cores: CoresTema;
  editable?: boolean;
} & Omit<
  React.ComponentProps<typeof TextInput>,
  | "style"
  | "value"
  | "onChangeText"
  | "placeholder"
  | "placeholderTextColor"
  | "editable"
>;

function CampoTexto({
  label,
  valor,
  aoMudar,
  placeholder,
  erro,
  cores,
  editable = true,
  ...resto
}: PropsCampoTexto) {
  return (
    <View style={styles.campos}>
      <Text style={[styles.label, { color: cores.textoSecundario }]}>
        {label}
      </Text>

      <TextInput
        {...resto}
        style={[
          styles.input,
          {
            color: cores.texto,
            backgroundColor: cores.input,
            borderColor: erro ? cores.perigo : cores.borda,
          },
        ]}
        value={valor}
        onChangeText={aoMudar}
        placeholder={placeholder}
        placeholderTextColor={cores.textoFraco}
        editable={editable}
      />

      {erro ? (
        <Text style={[styles.erroCampo, { color: cores.perigo }]}>{erro}</Text>
      ) : null}
    </View>
  );
}

type PropsCampoSenha = {
  label: string;
  valor: string;
  aoMudar: (texto: string) => void;
  placeholder: string;
  erro?: string;
  cores: CoresTema;
  visivel: boolean;
  alternarVisibilidade: () => void;
  editable?: boolean;
};

function CampoSenha({
  label,
  valor,
  aoMudar,
  placeholder,
  erro,
  cores,
  visivel,
  alternarVisibilidade,
  editable = true,
}: PropsCampoSenha) {
  return (
    <View style={styles.campos}>
      <Text style={[styles.label, { color: cores.textoSecundario }]}>
        {label}
      </Text>

      <View
        style={[
          styles.inputSenhaContainer,
          {
            backgroundColor: cores.input,
            borderColor: erro ? cores.perigo : cores.borda,
          },
        ]}
      >
        <TextInput
          style={[styles.inputSenha, { color: cores.texto }]}
          value={valor}
          onChangeText={aoMudar}
          placeholder={placeholder}
          placeholderTextColor={cores.textoFraco}
          secureTextEntry={!visivel}
          autoCapitalize="none"
          autoCorrect={false}
          editable={editable}
        />

        <Pressable
          style={styles.botaoOlho}
          onPress={alternarVisibilidade}
          accessibilityRole="button"
          accessibilityLabel={visivel ? "Ocultar senha" : "Mostrar senha"}
        >
          <Ionicons
            name={visivel ? "eye" : "eye-off"}
            size={20}
            color={cores.textoFraco}
          />
        </Pressable>
      </View>

      {erro ? (
        <Text style={[styles.erroCampo, { color: cores.perigo }]}>{erro}</Text>
      ) : null}
    </View>
  );
}

// ---------- Tela ----------

export default function Cadastro() {
  const router = useRouter();
  const { cores } = useTheme();

  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  const [erros, setErros] = useState<Erros>({});
  const [loading, setLoading] = useState(false);

  // Evita duplo envio mesmo se o botão for tocado duas vezes rapidamente
  const enviandoRef = useRef(false);

  const limparErro = (campo: Campo) =>
    setErros((atual) => ({ ...atual, [campo]: undefined }));

  // Permite somente letras e espaços
  const handleNome = (
    texto: string,
    campo: "nome" | "sobrenome",
    setter: (valor: string) => void
  ) => {
    setter(texto.replace(/[^a-zA-ZÀ-ÿ\s]/g, ""));
    limparErro(campo);
  };

  // Formata automaticamente para DD/MM/AAAA
  const handleDataNascimento = (texto: string) => {
    let data = texto.replace(/\D/g, "").slice(0, 8);

    if (data.length >= 5) {
      data = `${data.slice(0, 2)}/${data.slice(2, 4)}/${data.slice(4)}`;
    } else if (data.length >= 3) {
      data = `${data.slice(0, 2)}/${data.slice(2)}`;
    }

    setDataNascimento(data);
    limparErro("dataNascimento");
  };

  const validar = () => {
    const novos: Erros = {};

    const msgNome = validarNome(nome, "nome");
    if (msgNome) novos.nome = msgNome;

    const msgSobrenome = validarNome(sobrenome, "sobrenome");
    if (msgSobrenome) novos.sobrenome = msgSobrenome;

    const msgData = validarDataNascimento(dataNascimento);
    if (msgData) novos.dataNascimento = msgData;

    const msgEmail = validarEmail(email);
    if (msgEmail) novos.email = msgEmail;

    const msgSenha = validarSenha(senha);
    if (msgSenha) novos.senha = msgSenha;

    if (!confirmacaoSenha) {
      novos.confirmacaoSenha = "Confirme sua senha.";
    } else if (senha !== confirmacaoSenha) {
      novos.confirmacaoSenha = "As senhas não coincidem.";
    }

    setErros(novos);

    return Object.keys(novos).length === 0;
  };

  const criarConta = async () => {
    if (enviandoRef.current) return;

    if (!validar()) {
      mostrarAlerta(
        "Atenção",
        "Revise os campos destacados antes de continuar."
      );
      return;
    }

    enviandoRef.current = true;
    setLoading(true);

    try {
      const [dia, mes, ano] = dataNascimento.split("/");
      const dataNascimentoBanco = `${ano}-${mes}-${dia}`;

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: senha,
        options: {
          data: {
            nome: nome.trim(),
            sobrenome: sobrenome.trim(),
            data_nascimento: dataNascimentoBanco,
          },
        },
      });

      if (error) {
        mostrarAlerta(
          "Erro ao criar conta",
          traduzirErroAuth(error.message, error.code)
        );
        return;
      }

      if (!data.user) {
        mostrarAlerta(
          "Erro",
          "Não foi possível criar a conta. Tente novamente."
        );
        return;
      }

      // Com a confirmação de e-mail desativada, o Supabase devolve um
      // usuário sem identities quando o e-mail já está cadastrado.
      if ((data.user.identities?.length ?? 0) === 0) {
        mostrarAlerta(
          "E-mail já cadastrado",
          "Este e-mail já possui uma conta. Faça login ou recupere sua senha."
        );
        router.replace("/");
        return;
      }

      // Confirmação de e-mail ativada: ainda não existe sessão
      if (!data.session) {
        mostrarAlerta(
          "Confirme seu e-mail",
          `Enviamos um link de confirmação para ${email.trim()}. Confirme para começar a usar o FoodSave.`
        );
        router.replace("/");
        return;
      }

      mostrarAlerta(
        "Conta criada",
        "Sua conta foi criada com sucesso. Bem-vindo(a) ao FoodSave!"
      );
      router.replace("/home");
    } catch (erro) {
      console.error("Erro ao criar conta:", erro);
      mostrarAlerta(
        "Erro",
        "Ocorreu um erro ao criar a conta. Tente novamente."
      );
    } finally {
      enviandoRef.current = false;
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: cores.fundo },
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      
    >
      <View style={styles.areaVoltar}>
        <BotaoVoltar destinoFallback="/" />
      </View>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={[styles.titulo, { color: cores.texto }]}>
            Criar conta
          </Text>
          <Text style={[styles.subtitulo, { color: cores.textoSecundario }]}>
            Preencha seus dados para criar sua conta
          </Text>
        </View>

        <CampoTexto
          label="Nome"
          valor={nome}
          aoMudar={(texto) => handleNome(texto, "nome", setNome)}
          placeholder="Digite seu nome"
          erro={erros.nome}
          cores={cores}
          editable={!loading}
          autoCapitalize="words"
          autoComplete="name-given"
          textContentType="givenName"
        />

        <CampoTexto
          label="Sobrenome"
          valor={sobrenome}
          aoMudar={(texto) => handleNome(texto, "sobrenome", setSobrenome)}
          placeholder="Digite seu sobrenome"
          erro={erros.sobrenome}
          cores={cores}
          editable={!loading}
          autoCapitalize="words"
          autoComplete="name-family"
          textContentType="familyName"
        />

        <CampoTexto
          label="Data de nascimento"
          valor={dataNascimento}
          aoMudar={handleDataNascimento}
          placeholder="DD/MM/AAAA"
          erro={erros.dataNascimento}
          cores={cores}
          editable={!loading}
          keyboardType="numeric"
          maxLength={10}
        />

        <CampoTexto
          label="E-mail"
          valor={email}
          aoMudar={(texto) => {
            setEmail(texto);
            limparErro("email");
          }}
          placeholder="Digite seu e-mail"
          erro={erros.email}
          cores={cores}
          editable={!loading}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
        />

        <CampoSenha
          label="Senha"
          valor={senha}
          aoMudar={(texto) => {
            setSenha(texto);
            limparErro("senha");
            limparErro("confirmacaoSenha");
          }}
          placeholder="Digite sua senha"
          erro={erros.senha}
          cores={cores}
          visivel={mostrarSenha}
          alternarVisibilidade={() => setMostrarSenha(!mostrarSenha)}
          editable={!loading}
        />

        <CampoSenha
          label="Confirmar senha"
          valor={confirmacaoSenha}
          aoMudar={(texto) => {
            setConfirmacaoSenha(texto);
            limparErro("confirmacaoSenha");
          }}
          placeholder="Digite a senha novamente"
          erro={erros.confirmacaoSenha}
          cores={cores}
          visivel={mostrarConfirmacao}
          alternarVisibilidade={() =>
            setMostrarConfirmacao(!mostrarConfirmacao)
          }
          editable={!loading}
        />

        <Pressable
          style={[
            styles.botao,
            { backgroundColor: cores.primaria },
            loading && styles.botaoDesabilitado,
          ]}
          onPress={criarConta}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Criar conta"
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.textoBotao}>Criar conta</Text>
          )}
        </Pressable>

        <View style={styles.rodape}>
          <Text style={[styles.textoRodape, { color: cores.textoSecundario }]}>
            Já possui uma conta?
          </Text>
          <Link href="/" style={[styles.link, { color: cores.primariaTexto }]}>
            Entrar
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 30,
  },
  card: {
    width: "100%",
    maxWidth: 450,
  },
  header: {
    marginBottom: 28,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 14,
    lineHeight: 20,
  },
  campos: {
    width: "100%",
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 7,
  },
  areaVoltar: {
  width: "100%",
  maxWidth: 450,
  marginBottom: 10,
  },
  input: {
    width: "100%",
    height: 45,
    borderWidth: 1,
    borderRadius: 7,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  inputSenhaContainer: {
    width: "100%",
    height: 45,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 7,
  },
  inputSenha: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 12,
    fontSize: 14,
  },
  botaoOlho: {
    width: 45,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  erroCampo: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
  },
  botao: {
    width: "100%",
    height: 45,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
  },
  botaoDesabilitado: {
    opacity: 0.6,
  },
  textoBotao: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  rodape: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 24,
    paddingHorizontal: 10,
  },
  textoRodape: {
    fontSize: 14,
    marginRight: 5,
  },
  link: {
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
