import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface PainelProps {
  painel: {
    noPrazo: number;
    atencao: number;
    vencidos: number;
  };
}

export default function PainelValidade({ painel }: PainelProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Olá, User!</Text>
      <Text style={styles.title}>Seu painel de validades</Text>

      <View style={styles.cardsRow}>
        {/* Card No Prazo */}
        <View style={[styles.card, styles.cardNoPrazo]}>
          <Text style={styles.cardHeader} numberOfLines={1} adjustsFontSizeToFit>
            NO PRAZO
          </Text>
          <Text style={[styles.cardValue, { color: '#2ECC71' }]}>
            {painel.noPrazo}
          </Text>
          <Text style={styles.cardSubtitle}>itens saudáveis</Text>
        </View>

        {/* Card Atenção */}
        <View style={[styles.card, styles.cardAtencao]}>
          <View style={styles.headerWithIcon}>
            <Text style={styles.cardHeader} numberOfLines={1} adjustsFontSizeToFit>
              ATENÇÃO
            </Text>
            {/* Ícone levemente menor para acompanhar a fonte */}
            <Feather name="alert-triangle" size={10} color="#FF9800" />
          </View>
          <Text style={[styles.cardValue, { color: '#FF9800' }]}>
            {painel.atencao}
          </Text>
          <Text style={styles.cardSubtitle}>vencem em breve</Text>
        </View>

        {/* Card Vencidos */}
        <View style={[styles.card, styles.cardVencidos]}>
          <Text style={styles.cardHeader} numberOfLines={1} adjustsFontSizeToFit>
            VENCIDOS
          </Text>
          <Text style={[styles.cardValue, { color: '#FF4D4D' }]}>
            {painel.vencidos}
          </Text>
          <Text style={styles.cardSubtitle}>precisa descartar</Text>
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
    color: '#555',
    textAlign: 'center',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '900',
    marginVertical: 0, 
  },
  cardSubtitle: {
    fontSize: 10, 
    color: '#888',
    textAlign: 'center',
    lineHeight: 11,
  },
});