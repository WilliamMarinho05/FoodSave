import { Alert, Platform } from "react-native";

/**
 * Alert.alert NÃO funciona no navegador (react-native-web ignora a chamada).
 * Este helper usa window.alert na web e Alert.alert no celular.
 */
export function mostrarAlerta(titulo: string, mensagem: string) {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") {
      window.alert(`${titulo}\n\n${mensagem}`);
    }
    return;
  }
  Alert.alert(titulo, mensagem);
}

/** Traduz erros do Supabase Auth para mensagens amigáveis em português. */
export function traduzirErroAuth(mensagem?: string, codigo?: string) {
  const erro = (mensagem ?? "").toLowerCase();
  const code = (codigo ?? "").toLowerCase();

  if (code === "invalid_credentials" || erro.includes("invalid login credentials")) {
    return "E-mail ou senha incorretos. Verifique seus dados e tente novamente.";
  }
  if (code === "email_not_confirmed" || erro.includes("email not confirmed")) {
    return "Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.";
  }
  if (
    code === "user_already_exists" ||
    code === "email_exists" ||
    erro.includes("already registered") ||
    erro.includes("already been registered")
  ) {
    return "Este e-mail já está cadastrado.";
  }
  if (code === "signup_disabled") {
    return "O cadastro está temporariamente desativado. Tente novamente mais tarde.";
  }
  if (erro.includes("database error")) {
    return "Não foi possível concluir o cadastro no servidor. Tente novamente em instantes.";
  }
  if (code === "weak_password" || erro.includes("password should be at least")) {
    return "A senha é muito fraca. Use pelo menos 6 caracteres.";
  }
  if (code === "same_password" || erro.includes("different from the old password")) {
    return "A nova senha deve ser diferente da senha atual.";
  }
  if (erro.includes("invalid email") || code === "email_address_invalid") {
    return "Digite um e-mail válido.";
  }
  if (
    code === "over_request_rate_limit" ||
    code === "over_email_send_rate_limit" ||
    erro.includes("too many requests") ||
    erro.includes("rate limit")
  ) {
    return "Muitas tentativas. Aguarde alguns instantes e tente novamente.";
  }
  if (
    erro.includes("network") ||
    erro.includes("fetch failed") ||
    erro.includes("failed to fetch")
  ) {
    return "Não foi possível conectar ao servidor. Verifique sua internet.";
  }
  return "Ocorreu um erro. Tente novamente.";
}
