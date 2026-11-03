import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CoresTema = {
  /** Fundo principal das telas */
  fundo: string;
  /** Fundo alternativo (variação do fundo) */
  fundoAlternativo: string;
  /** Fundo de cards e superfícies elevadas */
  card: string;
  /** Fundo de superfícies secundárias (chips, campos, divisórias) */
  cardSecundario: string;
  /** Fundo de inputs */
  input: string;
  /** Texto principal */
  texto: string;
  /** Texto secundário (descrições, legendas) */
  textoSecundario: string;
  /** Texto fraco (placeholders, textos auxiliares) */
  textoFraco: string;
  /** Bordas padrão */
  borda: string;
  /** Bordas suaves (divisórias, cards) */
  bordaSuave: string;
  /** Verde principal da marca */
  primaria: string;
  /** Verde suave para fundos de ícones/destaques */
  primariaSuave: string;
  /** Verde legível sobre fundos escuros */
  primariaTexto: string;
  /** Vermelho de perigo/erro */
  perigo: string;
  /** Fundo suave de perigo */
  perigoSuave: string;
  /** Laranja de atenção */
  atencao: string;
  /** Fundo suave de atenção */
  atencaoSuave: string;
  /** Verde de sucesso */
  sucesso: string;
  /** Fundo suave de sucesso */
  sucessoSuave: string;
  /** Sobreposição escura atrás de modais */
  overlay: string;
  /** Cor base de sombras */
  sombra: string;
  /** Estilo da StatusBar para o tema atual */
  statusBar: "light" | "dark";
  /** Aparência do teclado para o tema atual */
  teclado: "light" | "dark";
};

export const coresClaro: CoresTema = {
  fundo: "#FAF9F6",
  fundoAlternativo: "#F4F8F5",
  card: "#FFFFFF",
  cardSecundario: "#F2F5F2",
  input: "#FFFFFF",
  texto: "#26332D",
  textoSecundario: "#6E7D75",
  textoFraco: "#8C9AA0",
  borda: "#E2E8E4",
  bordaSuave: "#EEEEEE",
  primaria: "#43855F",
  primariaSuave: "#EAF2EC",
  primariaTexto: "#43855F",
  perigo: "#C62828",
  perigoSuave: "#FFEDED",
  atencao: "#B8700B",
  atencaoSuave: "#FFF3E0",
  sucesso: "#287A43",
  sucessoSuave: "#EAF4E9",
  overlay: "rgba(38, 51, 45, 0.45)",
  sombra: "#000000",
  statusBar: "dark",
  teclado: "light",
};

export const coresEscuro: CoresTema = {
  fundo: "#121212",
  fundoAlternativo: "#171B18",
  card: "#1E1E1E",
  cardSecundario: "#262626",
  input: "#262626",
  texto: "#FFFFFF",
  textoSecundario: "#C4C4C4",
  textoFraco: "#9A9A9A",
  borda: "#2A2A2A",
  bordaSuave: "#333333",
  primaria: "#43855F",
  primariaSuave: "#263B30",
  primariaTexto: "#8FD6AA",
  perigo: "#FF6B6B",
  perigoSuave: "#3A2323",
  atencao: "#FFB74D",
  atencaoSuave: "#3A2E1E",
  sucesso: "#7FD69F",
  sucessoSuave: "#1F3327",
  overlay: "rgba(0, 0, 0, 0.65)",
  sombra: "#000000",
  statusBar: "light",
  teclado: "dark",
};

type ThemeContextData = {
  modoEscuro: boolean;
  alternarTema: () => void;
  cores: CoresTema;
};

const ThemeContext = createContext<ThemeContextData>({
  modoEscuro: false,
  alternarTema: () => {},
  cores: coresClaro,
});

const CHAVE_TEMA = "@foodsave_modo_escuro";

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [modoEscuro, setModoEscuro] = useState(false);

  useEffect(() => {
    async function carregarTema() {
      try {
        const temaSalvo = await AsyncStorage.getItem(CHAVE_TEMA);

        if (temaSalvo !== null) {
          setModoEscuro(temaSalvo === "true");
        }
      } catch (erro) {
        console.error("Erro ao carregar tema:", erro);
      }
    }

    carregarTema();
  }, []);

  const alternarTema = useCallback(async () => {
    const novoTema = !modoEscuro;

    setModoEscuro(novoTema);

    try {
      await AsyncStorage.setItem(CHAVE_TEMA, String(novoTema));
    } catch (erro) {
      console.error("Erro ao salvar tema:", erro);
    }
  }, [modoEscuro]);

  const cores = modoEscuro ? coresEscuro : coresClaro;

  const valor = useMemo<ThemeContextData>(
    () => ({
      modoEscuro,
      alternarTema,
      cores,
    }),
    [modoEscuro, alternarTema, cores]
  );

  return (
    <ThemeContext.Provider value={valor}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
