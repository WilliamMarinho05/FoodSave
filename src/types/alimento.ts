export interface Alimento {
  id?: string; 
  nome: string;
  categoria: string;
  quantidade: string; 
  unidade: string;
  peso: string;
  dataCompra: string;
  validade: string;
  fotoUri?: string;
}