import { useTheme } from "@/src/context/ThemeContext";
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface PainelProps {
  nomeUsuario?: string;
  painel: {
    noPrazo: number;
    atencao: number;
    vencidos: number;
  };
}

export default function PainelValidade({ painel, nomeUsuario }: PainelProps) {
  const { cores } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.greeting,{ color: cores.textoSecundario },]}>Olá, {nomeUsuario || 'User'}!</Text>
      <Text style={[styles.title,{ color: cores.texto },]}>Seu painel de validades</Text>

      <View style={styles.cardsRow}>
        {/* Card No Prazo */}
        <View style={[styles.card,{backgroundColor: cores.card,borderColor: cores.sucessoSuave,},]}>
          <Text style={[styles.cardHeader,{ color: cores.texto },]} numberOfLines={1} adjustsFontSizeToFit>
            NO PRAZO
          </Text>
          <Text style={[styles.cardValue, { color: cores.sucesso }]}>
            {painel.noPrazo}
          </Text>
          <Text style={[styles.cardSubtitle,{ color: cores.textoSecundario },]}>itens saudáveis</Text>
        </View>

        {/* Card Atenção */}
        <View style={[styles.card,{backgroundColor: cores.card,borderColor: cores.atencaoSuave,},]}>
          <View style={styles.headerWithIcon}>
            <Text style={[styles.cardHeader,{ color: cores.texto },]} numberOfLines={1} adjustsFontSizeToFit>
              ATENÇÃO
            </Text>
            {/* Ícone levemente menor para acompanhar a fonte */}
            <Feather name="alert-triangle" size={10} color={cores.atencao} />
          </View>
          <Text style={[styles.cardValue, { color: cores.atencao }]}>
            {painel.atencao}
          </Text>
          <Text style={[styles.cardSubtitle,{ color: cores.textoSecundario },]}>vencem em breve</Text>
        </View>

        {/* Card Vencidos */}
        <View style={[styles.card,{backgroundColor: cores.card,borderColor: cores.perigoSuave,},]}>
          <Text style={[styles.cardHeader,{ color: cores.texto },]} numberOfLines={1} adjustsFontSizeToFit>
            VENCIDOS
          </Text>
          <Text style={[styles.cardValue, { color: cores.perigo }]}>
            {painel.vencidos}
          </Text>
          <Text style={[styles.cardSubtitle,{ color: cores.textoSecundario },]}>precisa descartar</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 10, 
    backgroundColor: 'transparent',
    width: '100%',
  },
  greeting: {
    fontSize: 16, 
    fontWeight: '500',
    color: '#666',
    marginBottom: 2, 
  },
  title: {
    fontSize: 20, 
    fontWeight: '700',
    color: '#111',
    marginBottom: 12, 
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12, 
    borderWidth: 1.5,
    paddingVertical: 10, // Reduzido de 12
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 90,
  },
  cardNoPrazo: {
    borderColor: '#D1F2D9',
  },
  cardAtencao: {
    borderColor: '#FFE3C5',
  },
  cardVencidos: {
    borderColor: '#FFD6D6',
  },
  headerWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    width: '100%',
  },
  cardHeader: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '900',
    marginVertical: 0, 
  },
  cardSubtitle: {
    fontSize: 10, 
    textAlign: 'center',
    lineHeight: 11,
  },
});