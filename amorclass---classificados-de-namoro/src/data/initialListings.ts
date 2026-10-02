import { DatingListing } from '../types/classifieds';
import { getProfileAvatar } from './profileImages';

export const INITIAL_LISTINGS: DatingListing[] = [
  {
    id: 'ad-101',
    title: 'Mariana, 28 anos - Buscando amor tranquilo, cumplicidade e alguém para viajar',
    category: 'mulheres-homens',
    categoryLabel: 'Mulheres procurando Homens',
    age: 28,
    gender: 'Feminino',
    seeking: 'Homens',
    location: {
      country: 'Brasil',
      region: 'São Paulo',
      city: 'São Paulo',
      cityArea: 'Vila Mariana'
    },
    publishedDate: '01 de Outubro, 2026',
    modifiedDate: '01 de Outubro, 2026',
    views: 124,
    images: [
      getProfileAvatar('ad-101', 'Feminino', 28, 'Mariana Silva'),
      getProfileAvatar('ad-101-b', 'Feminino', 28, 'Mariana Silva Sorriso')
    ],
    description: `Olá! Sou a Mariana, tenho 28 anos, moro na zona sul de São Paulo e trabalho com Design de Produtos Digitais. Sou uma pessoa calma, com bom humor e que valoriza conversas profundas tanto quanto uma tarde de domingo assistindo filmes ou conhecendo um café novo.

Adoro cozinhar massas caseiras, ler ficção histórica e fazer pequenas viagens de fim de semana para o litoral ou serra. Não curto baladas cheias; prefiro jantares tranquilos, exposições em museus e momentos com amigos chegados.

Estou neste classificado porque acredito na transparência e procuro um homem solteiro (entre 27 e 38 anos), respeitoso, maduro e com valores parecidos, que queira construir um relacionamento sério baseado em cumplicidade, carinho e reciprocidade. Se você se identificou, fique à vontade para me enviar uma mensagem!`,
    attributes: {
      orientation: 'Heterossexual',
      height: '1,66m',
      relationshipStatus: 'Solteira',
      kids: 'Não tenho (quero ter no futuro)',
      smoking: 'Não fumante',
      drinking: 'Socialmente (vinho)',
      profession: 'Product Designer',
      zodiac: 'Touro',
      interests: ['Viagens', 'Cafés', 'Design', 'Culinária Italiana', 'Cinema']
    },
    contact: {
      name: 'Mariana Silva',
      email: 'mariana.silva@exemplo.com.br',
      showEmail: true,
      phone: '(11) 98721-4321',
      showPhone: true,
      whatsapp: '5511987214321',
      instagram: '@mariana.sp',
      verified: true,
      memberSince: 'Março de 2025',
      responseTime: 'Normalmente em 30 min'
    },
    comments: [
      {
        id: 'c-1',
        author: 'Felipe M.',
        email: 'felipe@email.com',
        rating: 5,
        title: 'Perfil super autêntico',
        content: 'Conversamos bastante, pessoa super educada e pontual. Recomendo muito!',
        date: 'Ontem às 19:40'
      }
    ],
    isFeatured: true
  },
  {
    id: 'ad-102',
    title: 'Lucas Andrade, 32 anos - Engenheiro apaixonado por trilhas e gastronomia',
    category: 'homens-mulheres',
    categoryLabel: 'Homens procurando Mulheres',
    age: 32,
    gender: 'Masculino',
    seeking: 'Mulheres',
    location: {
      country: 'Brasil',
      region: 'São Paulo',
      city: 'Campinas',
      cityArea: 'Cambuí'
    },
    publishedDate: '30 de Setembro, 2026',
    modifiedDate: '01 de Outubro, 2026',
    views: 89,
    images: [
      getProfileAvatar('ad-102', 'Masculino', 32, 'Lucas Andrade'),
      getProfileAvatar('ad-102-b', 'Masculino', 32, 'Lucas Andrade Outdoor')
    ],
    description: `Sou o Lucas, 32 anos, engenheiro civil em Campinas. Tenho rotina bem resolvida, pratico esportes ao ar livre e sou apaixonado por natureza e gastronomia.

Busco uma mulher inteligente, bem-humorada e leal, que goste tanto de aventuras ao ar livre quanto de uma noite aconchegante em casa com bom vinho e boa conversa. Valorizo sinceridade acima de tudo.`,
    attributes: {
      orientation: 'Heterossexual',
      height: '1,82m',
      relationshipStatus: 'Solteiro',
      kids: 'Não tenho',
      smoking: 'Não fumante',
      drinking: 'Socialmente',
      profession: 'Engenheiro Civil',
      zodiac: 'Capricórnio',
      interests: ['Trekking', 'Gastronomia', 'Ciclismo', 'Fotografia', 'Vinho']
    },
    contact: {
      name: 'Lucas Andrade',
      email: 'lucas.andrade@exemplo.com.br',
      showEmail: false,
      phone: '(19) 99123-8877',
      showPhone: true,
      whatsapp: '5519991238877',
      verified: true,
      memberSince: 'Janeiro de 2025',
      responseTime: 'Responde no mesmo dia'
    },
    comments: [],
    isFeatured: true
  },
  {
    id: 'ad-103',
    title: 'Camila Rocha, 26 anos - Carioca solar, arquiteta, amor por arte e praia',
    category: 'mulheres-homens',
    categoryLabel: 'Mulheres procurando Homens',
    age: 26,
    gender: 'Feminino',
    seeking: 'Homens',
    location: {
      country: 'Brasil',
      region: 'Rio de Janeiro',
      city: 'Rio de Janeiro',
      cityArea: 'Leblon / Ipanema'
    },
    publishedDate: '29 de Setembro, 2026',
    modifiedDate: '30 de Setembro, 2026',
    views: 215,
    images: [
      getProfileAvatar('ad-103', 'Feminino', 26, 'Camila Rocha'),
      getProfileAvatar('ad-103-b', 'Feminino', 26, 'Camila Rocha Praia')
    ],
    description: `Oi! Me chamo Camila, arquiteta e urbanista. Adoro o mar, acordar cedo para correr na orla, visitar feirinhas de antiguidades e desfrutar de momentos simples da vida.

Procuro alguém que tenha entusiasmo pela vida, energia leve e que queira um relacionamento verdadeiro, com admiração mútua e respeito.`,
    attributes: {
      orientation: 'Heterossexual',
      height: '1,70m',
      relationshipStatus: 'Solteira',
      kids: 'Não tenho',
      smoking: 'Não fumante',
      drinking: 'Ocasionalmente',
      profession: 'Arquiteta',
      zodiac: 'Leão',
      interests: ['Praia', 'Arte Urbana', 'Corrida', 'Arquitetura', 'MPB']
    },
    contact: {
      name: 'Camila Rocha',
      email: 'camila.rocha@exemplo.com.br',
      showEmail: true,
      phone: '(21) 98456-1122',
      showPhone: true,
      whatsapp: '5521984561122',
      instagram: '@camilarocha_arq',
      verified: true,
      memberSince: 'Fevereiro de 2025',
      responseTime: 'Geralmente em 1 hora'
    },
    comments: [
      {
        id: 'c-2',
        author: 'Eduardo P.',
        email: 'edu@email.com',
        rating: 5,
        title: 'Pessoa encantadora',
        content: 'Muito comunicativa e agradável.',
        date: '2 dias atrás'
      }
    ],
    isFeatured: true
  },
  {
    id: 'ad-104',
    title: 'Rodrigo Mendes, 36 anos - Homem maduro com propósito de construir família',
    category: 'relacionamento-serio',
    categoryLabel: 'Relacionamento Sério & Casamento',
    age: 36,
    gender: 'Masculino',
    seeking: 'Mulheres',
    location: {
      country: 'Brasil',
      region: 'Minas Gerais',
      city: 'Belo Horizonte',
      cityArea: 'Savassi'
    },
    publishedDate: '28 de Setembro, 2026',
    modifiedDate: '29 de Setembro, 2026',
    views: 167,
    images: [
      getProfileAvatar('ad-104', 'Masculino', 36, 'Rodrigo Mendes')
    ],
    description: `Sou o Rodrigo, 36 anos, empresário do setor de sustentabilidade em BH. Trabalho duro, mas sei que a vida só tem sentido pleno quando dividida com quem a gente ama.

Procuro uma mulher doce, decidida e que sonhe em construir um lar alegre, baseado em Deus, lealdade e respeito.`,
    attributes: {
      orientation: 'Heterossexual',
      height: '1,78m',
      relationshipStatus: 'Solteiro',
      kids: 'Não tenho (desejo ter)',
      smoking: 'Não fumante',
      drinking: 'Raramente',
      profession: 'Empresário',
      zodiac: 'Virgem',
      interests: ['Família', 'Empreendedorismo', 'Viagens de Carro', 'Livros', 'Música Clássica']
    },
    contact: {
      name: 'Rodrigo Mendes',
      email: 'rodrigo.mendes@exemplo.com.br',
      showEmail: false,
      phone: '(31) 99344-5566',
      showPhone: true,
      whatsapp: '5531993445566',
      verified: true,
      memberSince: 'Abril de 2024',
      responseTime: 'Responde rapidamente'
    },
    comments: [],
    isFeatured: true
  },
  {
    id: 'ad-105',
    title: 'Juliana e Fernanda, 29 anos - Procurando novas conexões e amizades coloridas em SP',
    category: 'lgbtqia',
    categoryLabel: 'LGBTQIA+ Encontros',
    age: 29,
    gender: 'Feminino',
    seeking: 'Mulheres',
    location: {
      country: 'Brasil',
      region: 'São Paulo',
      city: 'São Paulo',
      cityArea: 'Pinheiros'
    },
    publishedDate: '27 de Setembro, 2026',
    modifiedDate: '28 de Setembro, 2026',
    views: 198,
    images: [
      getProfileAvatar('ad-105', 'Feminino', 29, 'Juliana Pinheiros')
    ],
    description: `Olá! Sou a Juliana, 29 anos, jornalista e produtora cultural em São Paulo. Amo teatro, cinema independente, botecos clássicos com amigos e conversas sobre o mundo.

Busco mulheres interessantes, autênticas e que gostem de boas risadas para compartilhar a vida.`,
    attributes: {
      orientation: 'Lésbica',
      height: '1,68m',
      relationshipStatus: 'Solteira',
      kids: 'Não tenho',
      smoking: 'Não fumante',
      drinking: 'Socialmente (cerveja artesanal)',
      profession: 'Jornalista & Produtora',
      zodiac: 'Sagitário',
      interests: ['Teatro', 'Cinema', 'Cultura', 'Escrita', 'Café']
    },
    contact: {
      name: 'Juliana P.',
      email: 'juliana.cultura@exemplo.com.br',
      showEmail: true,
      phone: '(11) 97123-9988',
      showPhone: false,
      whatsapp: '5511971239988',
      verified: true,
      memberSince: 'Junho de 2025',
      responseTime: 'Responde em poucas horas'
    },
    comments: [],
    isFeatured: true
  },
  {
    id: 'ad-106',
    title: 'Fernando Ramos, 49 anos - Recomeço de vida, estabilidade e parceria sincera',
    category: 'quarenta-mais',
    categoryLabel: 'Namoro 40+ & Maturidade',
    age: 49,
    gender: 'Masculino',
    seeking: 'Mulheres',
    location: {
      country: 'Brasil',
      region: 'Paraná',
      city: 'Curitiba',
      cityArea: 'Batel'
    },
    publishedDate: '25 de Setembro, 2026',
    modifiedDate: '26 de Setembro, 2026',
    views: 142,
    images: [
      getProfileAvatar('ad-106', 'Masculino', 49, 'Fernando Ramos')
    ],
    description: `Olá a todas. Tenho 49 anos, divorciado, pai de dois filhos já adultos e independentes. Sou médico em Curitiba, amo música clássica, jazz, cozinhar nos finais de semana e viajar pelo mundo.

Procuro uma mulher madura, culta, carinhosa e que também deseje compartilhar momentos gostosos, jantares agradáveis e um companheirismo sólido.`,
    attributes: {
      orientation: 'Heterossexual',
      height: '1,80m',
      relationshipStatus: 'Divorciado',
      kids: 'Tenho filhos adultos',
      smoking: 'Não fumante',
      drinking: 'Aprecio bons vinhos',
      profession: 'Médico Cardiologista',
      zodiac: 'Câncer',
      interests: ['Vinhos', 'Jazz', 'Cozinha Internacional', 'Golfe', 'Viagens']
    },
    contact: {
      name: 'Fernando Ramos',
      email: 'dr.fernando.ramos@exemplo.com.br',
      showEmail: false,
      phone: '(41) 98899-7711',
      showPhone: true,
      whatsapp: '5541988997711',
      verified: true,
      memberSince: 'Dezembro de 2024',
      responseTime: 'Geralmente no mesmo dia'
    },
    comments: [
      {
        id: 'c-3',
        author: 'Helena S.',
        email: 'helena@email.com',
        rating: 5,
        title: 'Cavalheiro exemplar',
        content: 'Um homem muito educado e de excelente papo.',
        date: 'Semana passada'
      }
    ],
    isFeatured: true
  },
  {
    id: 'ad-107',
    title: 'Tatiana Vasconcelos, 34 anos - Encontros sem complicação, jantares e boa conversa',
    category: 'encontros-casuais',
    categoryLabel: 'Encontros Casuais',
    age: 34,
    gender: 'Feminino',
    seeking: 'Homens',
    location: {
      country: 'Brasil',
      region: 'Bahia',
      city: 'Salvador',
      cityArea: 'Rio Vermelho'
    },
    publishedDate: '24 de Setembro, 2026',
    modifiedDate: '25 de Setembro, 2026',
    views: 310,
    images: [
      getProfileAvatar('ad-107', 'Feminino', 34, 'Tatiana Vasconcelos')
    ],
    description: `Sou a Tatiana, 34 anos, advogada tributarista em Salvador. Minha rotina é bem dinâmica, então busco conexões leves, sem cobranças excessivas, com homens maduros e cavalheiros para um bom jantar, drinques ou um fim de semana agradável.`,
    attributes: {
      orientation: 'Heterossexual',
      height: '1,64m',
      relationshipStatus: 'Solteira e livre',
      kids: 'Não tenho',
      smoking: 'Não fumante',
      drinking: 'Socialmente (coquetéis)',
      profession: 'Advogada',
      zodiac: 'Escorpião',
      interests: ['Drinques', 'Alta Gastronomia', 'Praia', 'Moda', 'Viagens']
    },
    contact: {
      name: 'Tatiana Vasconcelos',
      email: 'tati.vasconcelos@exemplo.com.br',
      showEmail: true,
      phone: '(71) 99122-3344',
      showPhone: true,
      whatsapp: '5571991223344',
      verified: true,
      memberSince: 'Maio de 2025',
      responseTime: 'Responde em até 2 horas'
    },
    comments: [],
    isFeatured: false
  },
  {
    id: 'ad-108',
    title: 'Eduardo Nogueira, 29 anos - Amizades, novas histórias e quem sabe algo a mais',
    category: 'amizades',
    categoryLabel: 'Amizades & Companhia',
    age: 29,
    gender: 'Masculino',
    seeking: 'Todos',
    location: {
      country: 'Brasil',
      region: 'Distrito Federal',
      city: 'Brasília',
      cityArea: 'Asa Norte'
    },
    publishedDate: '22 de Setembro, 2026',
    modifiedDate: '23 de Setembro, 2026',
    views: 75,
    images: [
      getProfileAvatar('ad-108', 'Masculino', 29, 'Eduardo Nogueira')
    ],
    description: `Mudei recentemente para Brasília por conta de concurso público. Estou à procura de boas companhias para conhecer a cidade, pedalar pelo Parque da Cidade, tomar um café ou cerveja artesanal e trocar ideias sobre tecnologia e música.`,
    attributes: {
      orientation: 'Bissexual',
      height: '1,75m',
      relationshipStatus: 'Solteiro',
      kids: 'Não tenho',
      smoking: 'Não fumante',
      drinking: 'Cerveja artesanal',
      profession: 'Analista de TI',
      zodiac: 'Aquário',
      interests: ['Tecnologia', 'Ciclismo', 'Board Games', 'Cafés', 'Podcasts']
    },
    contact: {
      name: 'Eduardo N.',
      email: 'edu.nogueira@exemplo.com.br',
      showEmail: true,
      phone: '(61) 98111-2233',
      showPhone: false,
      whatsapp: '5561981112233',
      verified: true,
      memberSince: 'Julho de 2025',
      responseTime: 'Responde no dia'
    },
    comments: [],
    isFeatured: false
  },
  {
    id: 'ad-109',
    title: 'Renata Costa, 27 anos - Procurando namoro sério, cumplicidade e passeios',
    category: 'mulheres-homens',
    categoryLabel: 'Mulheres procurando Homens',
    age: 27,
    gender: 'Feminino',
    seeking: 'Homens',
    location: {
      country: 'Brasil',
      region: 'Minas Gerais',
      city: 'Ibirité',
      cityArea: 'Durval de Barros'
    },
    publishedDate: '01 de Outubro, 2026',
    modifiedDate: '01 de Outubro, 2026',
    views: 48,
    images: [
      getProfileAvatar('ad-109', 'Feminino', 27, 'Renata Costa')
    ],
    description: `Olá! Sou a Renata, moro no bairro Durval de Barros em Ibirité (Grande BH). Trabalho com pedagogia, amo passeios tranquilos, cafeteria, cozinhar para quem gosto e assistir filmes em casa.

Busco um homem trabalhador, respeitoso e com bom coração, que more na região metropolitana de BH ou Ibirité e deseje um relacionamento com futuro e lealdade.`,
    attributes: {
      orientation: 'Heterossexual',
      height: '1,63m',
      relationshipStatus: 'Solteira',
      kids: 'Não tenho',
      smoking: 'Não fumante',
      drinking: 'Raramente',
      profession: 'Professora / Pedagoga',
      zodiac: 'Câncer',
      interests: ['Café', 'Cinema', 'Passeios', 'Família', 'Livros']
    },
    contact: {
      name: 'Renata Costa',
      email: 'renata.costa@exemplo.com.br',
      showEmail: true,
      phone: '(31) 98711-2244',
      showPhone: true,
      whatsapp: '5531987112244',
      verified: true,
      memberSince: 'Agosto de 2025',
      responseTime: 'Responde rápido'
    },
    comments: [],
    isFeatured: true
  }
];
