import { DatingListing, PageView } from '../types/classifieds';

/**
 * Converts any string into a clean, search-engine-friendly URL slug
 * e.g., "São Paulo" -> "sao-paulo", "Mariana, 28 anos" -> "mariana-28-anos"
 */
export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric chars
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/-+/g, '-'); // Collapse dashes
}

/**
 * Builds a 100% SEO-optimized canonical URL for a profile:
 * /anuncio/:estado/:cidade/:bairro?/:genero/:titulo-slug-:id
 * Example with neighborhood: /anuncio/minas-gerais/ibirite/durval-de-barros/mulheres/mariana-28-anos-ad-101
 * Example without neighborhood: /anuncio/sao-paulo/sao-paulo/mulheres/mariana-28-anos-ad-101
 */
export function buildListingUrl(listing: DatingListing): string {
  const stateSlug = slugify(listing.location.region || 'brasil');
  const citySlug = slugify(listing.location.city || 'cidade');
  const areaSlug = listing.location.cityArea ? slugify(listing.location.cityArea) : '';
  const genderSlug = slugify(
    listing.gender === 'Feminino'
      ? 'mulheres'
      : listing.gender === 'Masculino'
      ? 'homens'
      : 'perfis'
  );
  const titleSlug = slugify(listing.title.slice(0, 70));

  if (areaSlug) {
    return `/anuncio/${stateSlug}/${citySlug}/${areaSlug}/${genderSlug}/${titleSlug}-${listing.id}`;
  }
  return `/anuncio/${stateSlug}/${citySlug}/${genderSlug}/${titleSlug}-${listing.id}`;
}

/**
 * Builds the URL for any PageView
 */
export function buildViewUrl(view: PageView, listings: DatingListing[]): string {
  switch (view.type) {
    case 'home':
      return '/';
    case 'detail': {
      const listing = listings.find((l) => l.id === view.listingId);
      const base = listing ? buildListingUrl(listing) : `/anuncio/${view.listingId}`;
      return view.autoOpenContact ? `${base}?contato=1` : base;
    }
    case 'search': {
      const params = new URLSearchParams();
      if (view.query) params.set('q', view.query);
      if (view.category) params.set('categoria', view.category);
      if (view.city) params.set('cidade', view.city);
      if (view.minAge) params.set('idade_min', view.minAge.toString());
      if (view.maxAge) params.set('idade_max', view.maxAge.toString());
      const qs = params.toString();
      return qs ? `/busca?${qs}` : '/busca';
    }
    case 'publish':
      return view.returnToListingId
        ? `/publicar?retorno=${encodeURIComponent(view.returnToListingId)}`
        : '/publicar';
    case 'login': {
      if (view.redirectTargetListingId) {
        const params = new URLSearchParams();
        params.set('para', view.redirectTargetListingId);
        if (view.registerFirst) params.set('cadastro', '1');
        return `/login?${params.toString()}`;
      }
      return '/login';
    }
    case 'favorites':
      return '/favoritos';
    case 'chat':
      return '/mensagens';
    case 'my-account':
      return '/minha-conta';
    case 'terms':
      return '/termos';
    case 'privacy':
      return '/privacidade';
    case 'contact':
      return '/contato';
    default:
      return '/';
  }
}

/**
 * Parses the current window.location pathname and search query into a PageView
 */
export function parseUrlToView(
  pathname: string,
  search: string,
  listings: DatingListing[]
): PageView {
  const path = pathname.replace(/\/+$/, '') || '/';
  const searchParams = new URLSearchParams(search);

  // Check detail route: /anuncio/.../:slug-:id or /anuncio/:id
  if (path.startsWith('/anuncio/')) {
    const parts = path.split('/').filter(Boolean);
    const lastPart = parts[parts.length - 1]; // e.g. "mariana-28-anos-ad-101" or "ad-101"

    // Match id format "ad-xxx"
    const idMatch = lastPart.match(/(ad-\d+[a-z0-9_-]*)$/i);
    const autoOpen = searchParams.get('contato') === '1';
    if (idMatch) {
      const matchedId = idMatch[1];
      const found = listings.find((l) => l.id === matchedId);
      if (found) {
        return { type: 'detail', listingId: found.id, autoOpenContact: autoOpen };
      }
    }

    // Direct check if lastPart is listing ID
    const directFound = listings.find((l) => l.id === lastPart);
    if (directFound) {
      return { type: 'detail', listingId: directFound.id, autoOpenContact: autoOpen };
    }
  }

  // Check query param direct id fallback: ?id=ad-101
  const queryId = searchParams.get('id');
  if (queryId) {
    const found = listings.find((l) => l.id === queryId);
    if (found) {
      return {
        type: 'detail',
        listingId: found.id,
        autoOpenContact: searchParams.get('contato') === '1'
      };
    }
  }

  if (path === '/busca' || searchParams.has('q') || searchParams.has('categoria') || searchParams.has('cidade')) {
    return {
      type: 'search',
      query: searchParams.get('q') || undefined,
      category: searchParams.get('categoria') || undefined,
      city: searchParams.get('cidade') || undefined,
      minAge: searchParams.get('idade_min') ? parseInt(searchParams.get('idade_min')!, 10) : undefined,
      maxAge: searchParams.get('idade_max') ? parseInt(searchParams.get('idade_max')!, 10) : undefined
    };
  }

  if (path === '/publicar') {
    const retorno = searchParams.get('retorno');
    return { type: 'publish', returnToListingId: retorno || undefined };
  }
  if (path === '/login') {
    const para = searchParams.get('para');
    const cadastro = searchParams.get('cadastro') === '1';
    return {
      type: 'login',
      redirectTargetListingId: para || undefined,
      registerFirst: cadastro
    };
  }
  if (path === '/favoritos') return { type: 'favorites' };
  if (path === '/chat' || path === '/mensagens') return { type: 'chat' };
  if (path === '/minha-conta' || path === '/conta') return { type: 'my-account' };
  if (path === '/termos') return { type: 'terms' };
  if (path === '/privacidade') return { type: 'privacy' };
  if (path === '/contato') return { type: 'contact' };

  return { type: 'home' };
}

/**
 * Injects and updates all Head metadata, Canonical URLs, and Schema.org JSON-LD
 * for total search engine indexability (Googlebot, Bing, social crawlers)
 */
export function updateDocumentSeo(
  view: PageView,
  listing?: DatingListing,
  categoryLabel?: string
): void {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '';
  const canonicalUrl = `${origin}${currentPath}`;

  let pageTitle = 'AmorClass - Classificados de Namoro e Encontros';
  let metaDescription =
    'Encontre relacionamento sério, encontros e companheirismo no AmorClass. Classificados com perfis verificados em todo o Brasil.';
  let ogType = 'website';
  let ogImage = `${origin}/favicon.ico`;
  let schemaData: Record<string, any> = {};

  if (view.type === 'detail' && listing) {
    const city = listing.location.city;
    const region = listing.location.region;
    const bairroPrefix = listing.location.cityArea ? `${listing.location.cityArea}, ` : '';
    const status = listing.attributes.relationshipStatus;
    const age = listing.age;

    pageTitle = `${listing.title} — ${bairroPrefix}${city} - ${region} | AmorClass`;
    metaDescription = `${listing.contact.name}, ${age} anos (${status}) em ${bairroPrefix}${city} - ${region}. ${listing.description.slice(0, 130)}... Veja perfil e contato no AmorClass.`;
    ogType = 'profile';
    ogImage = listing.images[0] || ogImage;

    // Rich Schema.org Person & ProfilePage for rich Google search snippets
    schemaData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'ProfilePage',
          '@id': canonicalUrl,
          url: canonicalUrl,
          name: pageTitle,
          description: metaDescription,
          datePublished: listing.publishedDate,
          dateModified: listing.modifiedDate,
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Início',
                item: origin
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: listing.categoryLabel,
                item: `${origin}/busca?categoria=${listing.category}`
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: `${listing.contact.name}, ${listing.age} anos — ${bairroPrefix}${city}`,
                item: canonicalUrl
              }
            ]
          },
          mainEntity: {
            '@type': 'Person',
            '@id': `${canonicalUrl}#person`,
            name: listing.contact.name,
            gender: listing.gender,
            description: listing.description,
            image: listing.images[0],
            address: {
              '@type': 'PostalAddress',
              streetAddress: listing.location.cityArea || undefined,
              addressLocality: listing.location.city,
              addressRegion: listing.location.region,
              addressCountry: 'BR'
            },
            knowsAbout: listing.attributes.interests || [],
            jobTitle: listing.attributes.profession || undefined
          }
        }
      ]
    };
  } else if (view.type === 'search') {
    const catName = categoryLabel || 'Todos os Perfis';
    const cityText = view.city ? ` em ${view.city}` : '';
    pageTitle = `${catName}${cityText} - Classificados de Namoro | AmorClass`;
    metaDescription = `Confira anúncios de ${catName.toLowerCase()}${cityText}. Perfis solteiros com fotos reais buscando relacionamento sério e encontros.`;
    schemaData = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: pageTitle,
      description: metaDescription,
      url: canonicalUrl
    };
  } else if (view.type === 'publish') {
    pageTitle = 'Publicar Anúncio de Namoro Grátis - AmorClass';
    metaDescription =
      'Crie e publique seu anúncio de namoro gratuitamente. Alcance pessoas solteiras com os mesmos objetivos na sua cidade.';
  } else if (view.type === 'login') {
    pageTitle = 'Acesso à Conta - AmorClass';
    metaDescription = 'Entre na sua conta do AmorClass para gerenciar seus anúncios e mensagens.';
  } else {
    // Home View
    schemaData = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'AmorClass',
      url: origin,
      description: metaDescription,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${origin}/busca?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    };
  }

  // Update DOM Title
  if (typeof document !== 'undefined') {
    document.title = pageTitle;

    // Helper to set meta tag
    const setMeta = (nameOrProperty: string, content: string, isProperty = false) => {
      const attr = isProperty ? `property="${nameOrProperty}"` : `name="${nameOrProperty}"`;
      let element = document.querySelector(`meta[${attr}]`);
      if (!element) {
        element = document.createElement('meta');
        if (isProperty) {
          element.setAttribute('property', nameOrProperty);
        } else {
          element.setAttribute('name', nameOrProperty);
        }
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    setMeta('description', metaDescription);
    setMeta('og:title', pageTitle, true);
    setMeta('og:description', metaDescription, true);
    setMeta('og:url', canonicalUrl, true);
    setMeta('og:type', ogType, true);
    setMeta('og:image', ogImage, true);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', pageTitle);
    setMeta('twitter:description', metaDescription);

    // Update or create Canonical link
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', canonicalUrl);

    // Update or create JSON-LD script
    let scriptTag = document.getElementById('amorclass-schema-jsonld');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'amorclass-schema-jsonld';
      scriptTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(schemaData);
  }
}
