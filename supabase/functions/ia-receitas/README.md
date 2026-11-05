# ia-receitas — Edge Function da IA de receitas (Groq + Supabase)

Esta função recebe a pergunta do usuário + o estoque cadastrado no app, valida
que quem chamou está logado no Supabase, chama o **Groq** (grátis, sem cartão)
e devolve a receita.

Só faltam **2 ações** para ligar:

---

## 0. Se você veio do Gemini (limpeza)

- Apague/desative a chave do Gemini no `aistudio.google.com`
- Se criou um projeto Cloud só por causa dela, confira em
  `console.cloud.google.com` → Billing se algum custo permanece e considere
  desativar a Generative Language API / apagar o projeto (sem novos usos,
  para de gerar cobrança)

## 1. Pegar a chave do Groq

1. Crie conta grátis em `console.groq.com` (sem cartão de crédito)
2. Menu → **API Keys** → **Create API Key**
3. Copie a chave (começa com `gsk_...`) e guarde — não compartilhe

## 2. Cadastrar o secret `GROQ_API_KEY` (se necessário, feito pelo DONO do projeto)

Quem tem o papel de Owner/Administrator no painel do Supabase faz, em 30s:

1. Painel do projeto → menu lateral → **Edge Functions**
2. Aba **Secrets** (Edge Function Secrets) → **Add new secret**
3. **Name:** `GROQ_API_KEY`
4. **Value:** a chave do Groq
5. Salvar

Não precisa dar papel de admin a ninguém: basta o dono cadastrar esse valor.

## 3. Criar/publicar a função

### Opção A — pelo painel (sem CLI, recomendada se o CLI der erro de privilégio)

1. Painel do projeto → **Edge Functions** → **Create a new function**
2. Escolha criar **via editor**
3. Nomeie a função exatamente como: `ia-receitas`
4. Cole em `index.ts` o conteúdo de `supabase/functions/ia-receitas/index.ts`
5. Clique em **Deploy**

> Se a função `ia-receitas` JÁ existir no painel (do teste anterior com o
> Gemini): abra ela → **Editor** → substitua o conteúdo de `index.ts` por
> este → **Deploy** de novo. O nome do secret mudou de `GEMINI_API_KEY`
> para `GROQ_API_KEY`!

### Opção B — pelo CLI (se a conta tiver permissão)

```bash
# na pasta raiz do projeto
npx supabase functions deploy ia-receitas
```

O conteúdo já está em `supabase/functions/ia-receitas/index.ts` — o código
do app não se altera de novo (continua apontando para `ia-receitas`).

## 4. Testar

Abra o app → aba **Assistente** → pergunte, por exemplo:

> "O que dá para cozinhar com o que tenho vencendo primeiro?"

Enquanto a função/secret não estiverem no ar, o chat responde com
`[Modo demonstração — IA ainda não conectada]`. Quando conectarem, as
respostas reais aparecem automaticamente.

## Se algo der errado

| Sintoma | Onde olhar |
|---|---|
| Respostas continuam "[Modo demonstração]" | Função não criada/renomeada, ou deploy falhou |
| Chat mostra "Ops! Não consegui responder agora." | Função existe mas a chamada falhou — veja **Edge Functions → ia-receitas → Logs** no painel |
| Log mostra `Groq não respondeu: ...` | `GROQ_API_KEY` ausente/incorreto, ou quota gratuita estourada |
| Log cita o modelo (`model_not_found`) | O modelo `llama-3.3-70b-versatile` mudou — pegue outro em `console.groq.com/docs/models` e troque só o `MODELO` no topo do arquivo |
