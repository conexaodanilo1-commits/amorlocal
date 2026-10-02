export interface StateLocation {
  id: string;
  name: string;
  uf: string;
  cities: CityLocation[];
}

export interface CityLocation {
  name: string;
  neighborhoods: string[];
}

export const BRAZIL_STATES: StateLocation[] = [
  {
    id: 'Minas Gerais',
    name: 'Minas Gerais',
    uf: 'MG',
    cities: [
      {
        name: 'Ibirité',
        neighborhoods: [
          'Durval de Barros',
          'Barreiro',
          'Centro',
          'Cascata',
          'Canaã',
          'Palmares',
          'Vila Ideal',
          'Jardim Montanhês',
          'Novo Horizonte',
          'Marilândia',
          'Várzea'
        ]
      },
      {
        name: 'Belo Horizonte',
        neighborhoods: [
          'Savassi',
          'Lourdes',
          'Funcionários',
          'Sion',
          'Buritis',
          'Belvedere',
          'Pampulha',
          'Santo Agostinho',
          'Anchieta',
          'Gutierrez',
          'Castelo',
          'Serra'
        ]
      },
      {
        name: 'Contagem',
        neighborhoods: [
          'Eldorado',
          'Cabral',
          'Inconfidentes',
          'Riacho das Pedras',
          'Cidade Industrial',
          'Fonte Grande',
          'Alvorada'
        ]
      },
      {
        name: 'Betim',
        neighborhoods: [
          'Centro',
          'Ingá',
          'Brasiléia',
          'Jardim da Cidade',
          'Alterosas',
          'PTB'
        ]
      },
      {
        name: 'Uberlândia',
        neighborhoods: ['Centro', 'Santa Mônica', 'Tibery', 'Fundinho', 'Martins', 'Granja Marileusa']
      },
      {
        name: 'Juiz de Fora',
        neighborhoods: ['Centro', 'São Mateus', 'Cascatinha', 'Granbery', 'Santa Helena']
      }
    ]
  },
  {
    id: 'São Paulo',
    name: 'São Paulo',
    uf: 'SP',
    cities: [
      {
        name: 'São Paulo',
        neighborhoods: [
          'Vila Mariana',
          'Pinheiros',
          'Jardins',
          'Moema',
          'Bela Vista',
          'Itaim Bibi',
          'Perdizes',
          'Tatuapé',
          'Santana',
          'Mooca',
          'Vila Madalena',
          'Morumbi',
          'Lapa',
          'Consolação'
        ]
      },
      {
        name: 'Campinas',
        neighborhoods: [
          'Cambuí',
          'Barão Geraldo',
          'Taquaral',
          'Nova Campinas',
          'Guanabara',
          'Centro',
          'Sousas'
        ]
      },
      {
        name: 'Santos',
        neighborhoods: ['Gonzaga', 'Boqueirão', 'Ponta da Praia', 'Embaré', 'Aparecida', 'Centro']
      },
      {
        name: 'São José dos Campos',
        neighborhoods: ['Jardim Aquárius', 'Vila Ema', 'Jardim Esplanada', 'Urbanova', 'Centro']
      },
      {
        name: 'Ribeirão Preto',
        neighborhoods: ['Jardim Botânico', 'Alto da Boa Vista', 'Irajá', 'Centro', 'Boulevard']
      },
      {
        name: 'Santo André',
        neighborhoods: ['Jardim', 'Campestre', 'Bairro Paraíso', 'Vila Bastos', 'Centro']
      }
    ]
  },
  {
    id: 'Rio de Janeiro',
    name: 'Rio de Janeiro',
    uf: 'RJ',
    cities: [
      {
        name: 'Rio de Janeiro',
        neighborhoods: [
          'Copacabana',
          'Ipanema',
          'Leblon',
          'Barra da Tijuca',
          'Botafogo',
          'Flamengo',
          'Tijuca',
          'Laranjeiras',
          'Recreio dos Bandeirantes',
          'Gávea',
          'Urca',
          'Centro'
        ]
      },
      {
        name: 'Niterói',
        neighborhoods: ['Icaraí', 'Ingá', 'Santa Rosa', 'Charitas', 'São Francisco', 'Camboinhas', 'Centro']
      },
      {
        name: 'Petrópolis',
        neighborhoods: ['Centro Histórico', 'Itaipava', 'Valparaíso', 'Quitandinha', 'Corrêas']
      }
    ]
  },
  {
    id: 'Paraná',
    name: 'Paraná',
    uf: 'PR',
    cities: [
      {
        name: 'Curitiba',
        neighborhoods: [
          'Batel',
          'Água Verde',
          'Bigorrilho',
          'Cabral',
          'Juvevê',
          'Centro Cívico',
          'Ecoville',
          'Santa Felicidade',
          'Centro'
        ]
      },
      {
        name: 'Londrina',
        neighborhoods: ['Gleba Palhano', 'Centro', 'Jardim Higienópolis', 'Bela Suíça']
      },
      {
        name: 'Maringá',
        neighborhoods: ['Zona 01', 'Zona 07', 'Jardim Alvorada', 'Centro']
      }
    ]
  },
  {
    id: 'Rio Grande do Sul',
    name: 'Rio Grande do Sul',
    uf: 'RS',
    cities: [
      {
        name: 'Porto Alegre',
        neighborhoods: [
          'Moinhos de Vento',
          'Petrópolis',
          'Bela Vista',
          'Menino Deus',
          'Cidade Baixa',
          'Bom Fim',
          'Centro Histórico'
        ]
      },
      {
        name: 'Caxias do Sul',
        neighborhoods: ['Centro', 'São Pelegrino', 'Pio X', 'Panazzolo']
      }
    ]
  },
  {
    id: 'Distrito Federal',
    name: 'Distrito Federal',
    uf: 'DF',
    cities: [
      {
        name: 'Brasília',
        neighborhoods: [
          'Asa Norte',
          'Asa Sul',
          'Sudoeste',
          'Noroeste',
          'Lago Sul',
          'Lago Norte',
          'Águas Claras',
          'Guará'
        ]
      }
    ]
  },
  {
    id: 'Bahia',
    name: 'Bahia',
    uf: 'BA',
    cities: [
      {
        name: 'Salvador',
        neighborhoods: [
          'Rio Vermelho',
          'Pituba',
          'Barra',
          'Graça',
          'Ondina',
          'Itaigara',
          'Caminho das Árvores',
          'Vitória',
          'Stella Maris'
        ]
      },
      {
        name: 'Feira de Santana',
        neighborhoods: ['Centro', 'Santa Mônica', 'Kalilândia', 'Brasília']
      }
    ]
  },
  {
    id: 'Santa Catarina',
    name: 'Santa Catarina',
    uf: 'SC',
    cities: [
      {
        name: 'Florianópolis',
        neighborhoods: [
          'Centro',
          'Agronômica',
          'Córrego Grande',
          'Jurerê Internacional',
          'Campeche',
          'Lagoa da Conceição',
          'Coqueiros'
        ]
      },
      {
        name: 'Balneário Camboriú',
        neighborhoods: ['Centro', 'Barra Sul', 'Pioneiros', 'Nações']
      },
      {
        name: 'Joinville',
        neighborhoods: ['América', 'Atiradores', 'Centro', 'Glória', 'Saguaçu']
      }
    ]
  },
  {
    id: 'Goiás',
    name: 'Goiás',
    uf: 'GO',
    cities: [
      { name: 'Goiânia', neighborhoods: ['Setor Bueno', 'Setor Marista', 'Setor Oeste', 'Jardim Goiás', 'Centro'] },
      { name: 'Aparecida de Goiânia', neighborhoods: ['Centro', 'Vila Brasília', 'Buriti Sereno'] },
      { name: 'Anápolis', neighborhoods: ['Jundiaí', 'Centro', 'Maracanã'] }
    ]
  },
  {
    id: 'Pernambuco',
    name: 'Pernambuco',
    uf: 'PE',
    cities: [
      { name: 'Recife', neighborhoods: ['Boa Viagem', 'Graças', 'Espinheiro', 'Pina', 'Casa Forte', 'Madalena'] },
      { name: 'Olinda', neighborhoods: ['Bultrins', 'Casa Caiada', 'Carmo', 'Bairro Novo'] },
      { name: 'Jaboatão dos Guararapes', neighborhoods: ['Piedade', 'Candeias', 'Prazeres'] }
    ]
  },
  {
    id: 'Ceará',
    name: 'Ceará',
    uf: 'CE',
    cities: [
      { name: 'Fortaleza', neighborhoods: ['Meireles', 'Aldeota', 'Cocó', 'Papicu', 'Varjota', 'Praia de Iracema'] },
      { name: 'Caucaia', neighborhoods: ['Centro', 'Jurema', 'Iparana'] }
    ]
  },
  {
    id: 'Espírito Santo',
    name: 'Espírito Santo',
    uf: 'ES',
    cities: [
      { name: 'Vitória', neighborhoods: ['Praia do Canto', 'Jardim da Penha', 'Jardim Camburi', 'Mata da Praia', 'Centro'] },
      { name: 'Vila Velha', neighborhoods: ['Praia da Costa', 'Itapuã', 'Itaparica', 'Centro'] },
      { name: 'Serra', neighborhoods: ['Laranjeiras', 'Jacaraípe', 'Manguinhos'] }
    ]
  },
  {
    id: 'Mato Grosso',
    name: 'Mato Grosso',
    uf: 'MT',
    cities: [
      { name: 'Cuiabá', neighborhoods: ['Goiabeiras', 'Jardim das Américas', 'Bosque da Saúde', 'Centro', 'Santa Rosa'] },
      { name: 'Várzea Grande', neighborhoods: ['Centro', 'Cristo Rei'] }
    ]
  },
  {
    id: 'Mato Grosso do Sul',
    name: 'Mato Grosso do Sul',
    uf: 'MS',
    cities: [
      { name: 'Campo Grande', neighborhoods: ['Chácara Cachoeira', 'Autonomista', 'Santa Fé', 'Centro', 'Jardim dos Estados'] },
      { name: 'Dourados', neighborhoods: ['Centro', 'Jardim Flórida'] }
    ]
  },
  {
    id: 'Amazonas',
    name: 'Amazonas',
    uf: 'AM',
    cities: [
      { name: 'Manaus', neighborhoods: ['Adrianópolis', 'Ponta Negra', 'Vieiralves', 'Centro', 'Parque 10 de Novembro'] }
    ]
  },
  {
    id: 'Pará',
    name: 'Pará',
    uf: 'PA',
    cities: [
      { name: 'Belém', neighborhoods: ['Umarizal', 'Nazaré', 'Batista Campos', 'Marco', 'Reduto'] },
      { name: 'Ananindeua', neighborhoods: ['Cidade Nova', 'Centro'] }
    ]
  },
  {
    id: 'Maranhão',
    name: 'Maranhão',
    uf: 'MA',
    cities: [
      { name: 'São Luís', neighborhoods: ['Ponta d\'Areia', 'Renascença', 'Calhau', 'Olho d\'Água', 'Centro'] }
    ]
  },
  {
    id: 'Paraíba',
    name: 'Paraíba',
    uf: 'PB',
    cities: [
      { name: 'João Pessoa', neighborhoods: ['Manaíra', 'Tambaú', 'Cabo Branco', 'Bessa', 'Altiplano'] },
      { name: 'Campina Grande', neighborhoods: ['Centro', 'Catolé', 'Prata'] }
    ]
  },
  {
    id: 'Rio Grande do Norte',
    name: 'Rio Grande do Norte',
    uf: 'RN',
    cities: [
      { name: 'Natal', neighborhoods: ['Ponta Negra', 'Petrópolis', 'Tirol', 'Capim Macio', 'Candelária'] },
      { name: 'Parnamirim', neighborhoods: ['Nova Parnamirim', 'Centro'] }
    ]
  },
  {
    id: 'Alagoas',
    name: 'Alagoas',
    uf: 'AL',
    cities: [
      { name: 'Maceió', neighborhoods: ['Ponta Verde', 'Pajuçara', 'Jatiúca', 'Mangabeiras', 'Cruz das Almas'] }
    ]
  },
  {
    id: 'Piauí',
    name: 'Piauí',
    uf: 'PI',
    cities: [
      { name: 'Teresina', neighborhoods: ['Jóquei', 'Fátima', 'Ilhotas', 'São Cristóvão', 'Centro'] }
    ]
  },
  {
    id: 'Sergipe',
    name: 'Sergipe',
    uf: 'SE',
    cities: [
      { name: 'Aracaju', neighborhoods: ['Atalaia', '13 de Julho', 'Jardins', 'Grageru', 'Centro'] }
    ]
  },
  {
    id: 'Rondônia',
    name: 'Rondônia',
    uf: 'RO',
    cities: [
      { name: 'Porto Velho', neighborhoods: ['Olaria', 'São Cristóvão', 'Centro'] }
    ]
  },
  {
    id: 'Tocantins',
    name: 'Tocantins',
    uf: 'TO',
    cities: [
      { name: 'Palmas', neighborhoods: ['Plano Diretor Sul', 'Plano Diretor Norte', 'Taquaralto'] }
    ]
  },
  {
    id: 'Acre',
    name: 'Acre',
    uf: 'AC',
    cities: [
      { name: 'Rio Branco', neighborhoods: ['Bosque', 'Cerâmica', 'Centro'] }
    ]
  },
  {
    id: 'Amapá',
    name: 'Amapá',
    uf: 'AP',
    cities: [
      { name: 'Macapá', neighborhoods: ['Central', 'Santa Rita', 'Trem'] }
    ]
  },
  {
    id: 'Roraima',
    name: 'Roraima',
    uf: 'RR',
    cities: [
      { name: 'Boa Vista', neighborhoods: ['São Pedro', 'Paraviana', 'Centro'] }
    ]
  }
];

export function getCitiesForState(stateName: string): CityLocation[] {
  const found = BRAZIL_STATES.find(
    (s) =>
      s.name.toLowerCase() === stateName.toLowerCase() ||
      s.uf.toLowerCase() === stateName.toLowerCase() ||
      stateName.toLowerCase().includes(s.name.toLowerCase()) ||
      stateName.toLowerCase().includes(s.uf.toLowerCase())
  );
  return found ? found.cities : [];
}

export function getNeighborhoodsForCity(stateName: string, cityName: string): string[] {
  const cities = getCitiesForState(stateName);
  const foundCity = cities.find(
    (c) => c.name.toLowerCase() === cityName.toLowerCase().trim()
  );
  return foundCity ? foundCity.neighborhoods : [];
}
