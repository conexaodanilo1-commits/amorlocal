import { CategoryDef } from '../types/classifieds';

export const CATEGORIES: CategoryDef[] = [
  {
    id: 'mulheres-homens',
    slug: 'mulheres-procurando-homens',
    name: 'Mulheres procurando Homens',
    shortName: 'Mulheres buscando Homens',
    iconName: 'HeartHandshake',
    iconColor: '#e05353',
    count: 142,
    description: 'Mulheres solteiras procurando homens para relacionamento ou romance.'
  },
  {
    id: 'homens-mulheres',
    slug: 'homens-procurando-mulheres',
    name: 'Homens procurando Mulheres',
    shortName: 'Homens buscando Mulheres',
    iconName: 'UserCheck',
    iconColor: '#e67e22',
    count: 198,
    description: 'Homens solteiros buscando mulheres para namoro e encontros.'
  },
  {
    id: 'relacionamento-serio',
    slug: 'relacionamento-serio',
    name: 'Relacionamento Sério & Casamento',
    shortName: 'Relacionamento Sério',
    iconName: 'Gem',
    iconColor: '#b9770e',
    count: 87,
    description: 'Pessoas com intenção de construir família e namoro duradouro.'
  },
  {
    id: 'encontros-casuais',
    slug: 'encontros-casuais',
    name: 'Encontros Casuais',
    shortName: 'Encontros Casuais',
    iconName: 'Sparkles',
    iconColor: '#9b59b6',
    count: 115,
    description: 'Conversas descontraídas, jantares e encontros sem compromisso fixo.'
  },
  {
    id: 'lgbtqia',
    slug: 'lgbtqia',
    name: 'LGBTQIA+ Encontros',
    shortName: 'LGBTQIA+',
    iconName: 'Rainbow',
    iconColor: '#16a085',
    count: 76,
    description: 'Mulheres buscando mulheres, homens buscando homens e relacionamentos não-binários.'
  },
  {
    id: 'quarenta-mais',
    slug: 'namoro-40-50-mais',
    name: 'Namoro 40+ & Maturidade',
    shortName: 'Namoro 40+ e 50+',
    iconName: 'Compass',
    iconColor: '#27ae60',
    count: 64,
    description: 'Pessoas maduras em busca de uma nova história de amor e carinho.'
  },
  {
    id: 'amizades',
    slug: 'amizade-e-companhia',
    name: 'Amizades & Companhia',
    shortName: 'Amizade & Companhia',
    iconName: 'Coffee',
    iconColor: '#2c3e50',
    count: 53,
    description: 'Conhecer novas pessoas para sair, conversar e compartilhar interesses.'
  },
  {
    id: 'viagens',
    slug: 'viagens-a-dois',
    name: 'Viagens & Companhia a Dois',
    shortName: 'Viagens a Dois',
    iconName: 'Palmtree',
    iconColor: '#2980b9',
    count: 39,
    description: 'Parceiros para viajar, conhecer novos lugares e viver aventuras juntos.'
  }
];

export const POPULAR_REGIONS = [
  { name: 'São Paulo (SP)', state: 'SP', count: 210 },
  { name: 'Rio de Janeiro (RJ)', state: 'RJ', count: 145 },
  { name: 'Minas Gerais (MG)', state: 'MG', count: 98 },
  { name: 'Paraná (PR)', state: 'PR', count: 72 },
  { name: 'Rio Grande do Sul (RS)', state: 'RS', count: 65 },
  { name: 'Distrito Federal (DF)', state: 'DF', count: 54 },
  { name: 'Bahia (BA)', state: 'BA', count: 48 },
  { name: 'Santa Catarina (SC)', state: 'SC', count: 42 }
];
