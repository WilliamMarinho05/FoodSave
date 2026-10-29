# ia-receitas — Edge Function da IA de receitas (Passo a passo de ativação)

Esta função recebe a pergunta do usuário + o estoque cadastrado no app, valida
que quem chamou está logado no Supabase, chama o Gemini e devolve a receita.

Só faltam **2 ações** para ligar:

---

## 1. Cadastrar o secret `GEMINI_API_KEY` (feito pelo DONO do projeto)

A chave é obtida GRATIS em `aistudio.google.com` → **Get API key** (prefira gerar
uma chave nova em vez de compartilhar a que já existe).

Quem tem o papel de Owner/Administrator no painel do Supabase faz, em 30s:

1. Abra o painel do projeto → menu lateral → **Edge Functions**
2. Aba **Secrets** (Edge Function Secrets) → **Add new secret**
3. **Name:** `GEMINI_API_KEY`
4. **Value:** a chave do Gemini (começa com `AQ.` ou `AIza`)
5. Salvar

> Não precisa dar papel de admin a ninguém: basta o dono cadastrar esse valor.

## 2. Criar/publicar a função

### Opção A — pelo painel (sem CLI, recomendada no seu caso)

1. Painel do projeto → **Edge Functions** → **Create a new function**
2. Escolha criar **via editor**
3. Nomeie a função exatamente como: `ia-receitas`
4. Cole em `index.ts` o conteúdo de `supabase/functions/ia-receitas/index.ts`
   (este mesma pasta)
5. Clique em **Deploy**

### Opção B — pelo CLI (se a conta do CLI tiver permissão de deploy)

```bash
# na pasta raiz do projeto
npx supabase functions deploy ia-receitas
```

---

## 3. Testar

Abra o app → aba **Assistente** → pergunte, por exemplo:

> "O que dá para cozinhar com o que tenho vencendo primeiro?"

Enquanto a função/secret não estiverem no ar, o chat responde com
`[Modo demonstração — IA ainda não conectada]`. Quando conectarem, as
respostas reais aparecem automaticamente — nenhuma mudança no app é
necessária de novo (o app já chama a função `ia-receitas`).

## Se algo der errado

| Sintoma | Onde olhar |
|---|---|
| Respostas continuam "[Modo demonstração]" | Função não criada/renomeadaerrada, ou deploy falhou |
| Chat mostra "Ops! Não consegui responder agora." | Função existe mas a chamada falhou — veja **Edge Functions → ia-receitas → Logs** no painel |
| Log mostra "A IA não devolveu resposta." | Secret `GEMINI_API_KEY` ausente/incorreto, ou quota gratuita estourada |
