import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

type ThemeContextData = {
  modoEscuro: boolean;
  alternarTema: () => void;
};

const ThemeContext = createContext<ThemeContextData>({
  modoEscuro: false,
  alternarTema: () => {},
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

  async function alternarTema() {
    const novoTema = !modoEscuro;

    setModoEscuro(novoTema);

    try {
      await AsyncStorage.setItem(
        CHAVE_TEMA,
        String(novoTema)
      );
    } catch (erro) {
      console.error("Erro ao salvar tema:", erro);
    }
  }

  return (
    <ThemeContext.Provider
      value={{
        modoEscuro,
        alternarTema,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}