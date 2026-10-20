import BarraExp from '@/src/components/BarraExp';
import { supabase } from '@/src/lib/supabase';
import { getEstatisticasPerfil } from '@/src/services/painelAlimentos';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function Perfil() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>('Carregando...');
  const [nome, setNome] = useState<string | null>('Usuário');
  const [estatisticas, setEstatisticas] = useState({ cadastrados: 0, salvos: 0, descartados: 0 });

  useFocusEffect(
    useCallback(() => {
      async function carregarDadosPerfil() {
        // Busca os dados do usuário
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setEmail(user.email ?? '');
          setNome(user.user_metadata?.nome || 'Katty Santos'); 
        }

        // Busca as estatísticas de alimentos
        const stats = await getEstatisticasPerfil();
        setEstatisticas(stats);
      }

      carregarDadosPerfil();
    }, [])
  );

  const handleSair = async () => {
    await supabase.auth.signOut();
    router.replace('/'); 
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.title}>PERFIL</Text>
        <Pressable style={styles.bellButton}>
          <Feather name="bell" size={20} color="#333" />
        </Pressable>
      </View>

      {/* Info do Usuário */}
      <View style={styles.userInfoContainer}>
        <View style={styles.imageBorder}>
          <Image 
            source={{ uri: 'https://i.pravatar.cc/150?img=47' }} // Substitua pela foto real do usuário se houver
            style={styles.profileImage} 
          />
        </View>
        <Text style={styles.userName}>{nome}</Text>
        <Text style={styles.userEmail}>{email}</Text>
      </View>

      {/* Barra de XP Dinâmica */}
      <View style={styles.xpContainer}>
        <BarraExp />
      </View>

      {/* Cards de Estatísticas */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel} numberOfLines={1} adjustsFontSizeToFit>CADASTRADOS</Text>
          <Text style={[styles.statValue, { color: '#43855F' }]}>{estatisticas.cadastrados}</Text>
          <Text style={styles.statDesc}>itens no total</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statLabel} numberOfLines={1} adjustsFontSizeToFit>SALVOS</Text>
          <Text style={[styles.statValue, { color: '#2ECC71' }]}>{estatisticas.salvos}</Text>
          <Text style={styles.statDesc}>consumidos</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel} numberOfLines={1} adjustsFontSizeToFit>DESCARTADOS</Text>
          <Text style={[styles.statValue, { color: '#FF4D4D' }]}>{estatisticas.descartados}</Text>
          <Text style={styles.statDesc}>não consumidos</Text>
        </View>
      </View>

      {/* Menu de Opções */}
      <View style={styles.menuContainer}>
        <OpcaoMenu icone="person-outline" texto="Dados Pessoais" onPress={() => router.push("../dados_pessoais")}/>
        <OpcaoMenu icone="notifications-outline" texto="Notificações"/>
        <OpcaoMenu icone="list-outline"texto="Categorias de Alimentos"onPress={() => router.push("/categoria")}/> 
        <OpcaoMenu icone="information-circle-outline"texto="Sobre o App" onPress={() => router.push("../sobre") } />
        <OpcaoMenu icone="help-circle-outline"texto="Ajuda e Suporte"onPress={() => router.push("/ajuda")}/>
      </View>

      {/* Botão Sair */}
      <Pressable style={styles.logoutButton} onPress={handleSair}>
        <Text style={styles.logoutText}>Sair da Conta</Text>
      </Pressable>
    </ScrollView>
  );
}

// Componente para renderizar cada linha do menu dinamicamente
function OpcaoMenu({ icone, texto ,onPress }: { icone: any, texto: string ;onPress?: ()=>void; }) {
  return (
    <Pressable style={styles.menuItem}onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIconContainer}>
          <Ionicons name={icone} size={20} color="#43855F" />
        </View>
        <Text style={styles.menuItemText}>{texto}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#888" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6', 
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#43855F',
  },
  bellButton: {
    backgroundColor: '#F0EFEB',
    padding: 8,
    borderRadius: 20,
  },
  userInfoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imageBorder: {
    padding: 3,
    borderWidth: 2,
    borderColor: '#43855F',
    borderRadius: 60,
    marginBottom: 12,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  xpContainer: {
    marginBottom: 20,
    // Remove o padding interno do container para deixar a BarraExp ocupar o espaço
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 4,
  },
  statDesc: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
  },
  menuContainer: {
    marginBottom: 30,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    backgroundColor: '#EAF2EC',
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  logoutButton: {
    borderWidth: 1.5,
    borderColor: '#FF4D4D',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoutText: {
    color: '#FF4D4D',
    fontSize: 16,
    fontWeight: 'bold',
  },
});