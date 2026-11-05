import * as Linking from "expo-linking";
import { Platform } from "react-native";
import "react-native-url-polyfill/auto";

import { supabase } from "../lib/supabase";

const ROTA_REDEFINIR_SENHA = "redefinir_senha";

/**
 * Monta a URL para onde o Supabase deve redirecionar após o usuário
 * clicar no link de recuperação enviado por e-mail.
 *
 * - Web: usa a origem atual (funciona em localhost e em produção).
 * - Mobile: usa o deep link do app (Expo Go ou build).
 */
export function obterUrlRedirecionamento(): string {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return `${window.location.origin}/${ROTA_REDEFINIR_SENHA}`;
  }

  return Linking.createURL(ROTA_REDEFINIR_SENHA);
}

type ParametrosRecuperacao = {
  accessToken: string | null;
  refreshToken: string | null;
  code: string | null;
  errorDescription: string | null;
};

/**
 * Extrai os parâmetros do link de recuperação.
 * Suporta tokens no hash (fluxo implícito) e `code` na query (PKCE),
 * que é o formato usado em deep links.
 */
export function extrairParametrosRecuperacao(
  url: string
): ParametrosRecuperacao {
  const texto = url ?? "";
  const indiceHash = texto.indexOf("#");
  const indiceQuery = texto.indexOf("?");
  const parametros = new URLSearchParams();

  if (indiceHash >= 0) {
    new URLSearchParams(texto.slice(indiceHash + 1)).forEach((valor, chave) => {
      parametros.set(chave, valor);
    });
  }

  if (indiceQuery >= 0) {
    const fimQuery = indiceHash >= 0 ? indiceHash : texto.length;
    new URLSearchParams(
      texto.slice(indiceQuery + 1, fimQuery)
    ).forEach((valor, chave) => {
      parametros.set(chave, valor);
    });
  }

  return {
    accessToken: parametros.get("access_token"),
    refreshToken: parametros.get("refresh_token"),
    code: parametros.get("code"),
    errorDescription:
      parametros.get("error_description") ?? parametros.get("error"),
  };
}

/**
 * Cria a sessão de recuperação a partir do link recebido.
 * Retorna `ok: false` com uma mensagem amigável quando o link é inválido.
 */
export async function criarSessaoRecuperacao(
  url: string
): Promise<{ ok: boolean; erro?: string }> {
  const { accessToken, refreshToken, code, errorDescription } =
    extrairParametrosRecuperacao(url);

  if (errorDescription) {
    return {
      ok: false,
      erro: errorDescription.replace(/\+/g, " "),
    };
  }

  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    return error
      ? { ok: false, erro: error.message }
      : { ok: true };
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    return error
      ? { ok: false, erro: error.message }
      : { ok: true };
  }

  return {
    ok: false,
    erro: "Link de recuperação inválido ou incompleto.",
  };
}
