# ia-nota-fiscal — leitura de nota fiscal com visão (Groq + Supabase)

Esta função recebe a **foto da nota fiscal** em base64, valida que quem chamou
está logado no Supabase e usa o modelo multimodal **`qwen/qwen3.8-27b`** da
Groq para extrair, de cada alimento:

- **nome** (limpo, pronto para o cadastro)
- **quantidade** (inteira, já convertida para uma unidade aceita pelo app)
- **preço** (unitário e total da linha)

Ela também devolve o nome do mercado, a data da compra e o total da nota.

> Usa o **mesmo secret** `GROQ_API_KEY` da função `ia-receitas` — se ele já
> estiver cadastrado, não precisa criar outro.

---

## 1. Publicar a função

### Opção A — pelo painel (sem CLI)

1. Painel do Supabase → **Edge Functions**
2. **Create a new function** → criar **via editor**
3. Nome exatamente: `ia-nota-fiscal`
4. Cole em `index.ts` o conteúdo de
   `supabase/functions/ia-nota-fiscal/index.ts`
5. **Deploy**

### Opção B — pelo CLI (se a conta tiver permissão)

```bash
npx supabase functions deploy ia-nota-fiscal
```

## 2. Testar no app

1. Abra o app → **Cadastrar Alimento**
2. Toque em **Cadastrar por Nota Fiscal**
3. Fotografe a nota (de preferência inteira, plana e bem iluminada)
4. Toque em **Analisar com IA**
5. A tela de resultados mostra os itens com **nome, quantidade e preço**.
   Toque em um item para abrir o cadastro já preenchido

A validade não vem na nota: o app já preenche a data de compra e você só
escolhe a validade antes de salvar.

## Se algo der errado

| Sintoma | Onde olhar |
|---|---|
| "Não foi possível analisar a nota agora" | **Edge Functions → ia-nota-fiscal → Logs** |
| Log mostra `Groq não respondeu: ...` | `GROQ_API_KEY` ausente/incorreto ou quota gratuita estourada |
| Log mostra `model_not_found` / 403 | Modelo sem acesso no plano — veja `console.groq.com/docs/vision` e troque o `MODELO` no topo do arquivo |
| "Não consegui interpretar a nota" | Foto escura/tremida ou nota cortada: tente de novo com a nota inteira e bem iluminada |
| Nenhum item encontrado | O cupom pode ter só códigos internos; use o botão **Cadastrar manualmente** |

## Observações

- A foto é reduzida (máx. 1400px, JPEG) no app antes do envio, para caber no
  limite de tamanho da função e responder mais rápido.
- O modelo pode errar leituras ruins: a tela de revisão existe justamente
  para o usuário conferir antes de cadastrar.
- Preço é apenas informativo: a tabela `alimentos` não tem coluna de preço,
  então ele não é salvo no estoque.
