// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = 'Medibookit';
export const SITE_DESCRIPTION = 'Reserva y espacio Medico en Ecuador';
export const SITE_URL = 'https://zenix.farros.co'; // Replace with your domain
export const REPOSITORY_URL = 'https://github.com/farrosfr/zenix';

// Brand Settings
export const BRAND_NAME = 'edibook';
export const BRAND_LOGO_TEXT = 'M';

// Social Links
export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/farrosfr_',
  github: 'https://github.com/farrosfr',
  linkedin: 'https://linkedin.com/in/yourhandle',
};

// Navigation Links
export const NAV_LINKS = [
  { href: '/', label: 'Inicio' },

  {
    href: '/servicios/',
    label: 'Servicios',
    children: [
      {
        href: '/servicios/contentseries/',
        label: 'Contentseries'
      },
      {
        href: '/servicios/podcastcorporativo/',
        label: 'Codcast Corporativo'
      },
      {
        href: '/servicios/transmisionescoberturas/',
        label: 'Transmisiones y Coberturas'
      },
      {
        href: '/servicios/produccionaudiovisual/',
        label: 'Produccion audiovisual'
      },
      {
        href: '/servicios/estrategiacomunicacion/',
        label: 'Estrategia de comunicacion'
      },
      {
        href: '/servicios/marketingcontenidos/',
        label: 'Marketing de contenidos'
      },
      {
        href: '/servicios/dossiersestrategicos/',
        label: 'Dossiers estrategicos'
      },
      {
        href: '/servicios/desarrolloweb/',
        label: 'Desarrollo web'
      },
      {
        href: '/servicios/desarrolloaplicaciones/',
        label: 'Desarrollo de Aplicaciones'
      },
      {
        href: '/servicios/posicionamientoseo/',
        label: 'Posicionamiento seo'
      },
      
      
    ]
  },

  { href: '/casos/', label: 'Casos' },
  { href: '/contactos/', label: 'Contactos' },
  { href: '/blog/', label: 'Blog' }
];
// Footer Links
export const FOOTER_LINKS = [
  {
    title: 'Navegación',
    links: [
      { label: 'inicio', href: '/#features' },
      { label: 'Nosotros', href: '/pricing/' },
      { label: 'Servicios', href: '/changelog/' },
      { label: 'Integrations', href: '#' },
    ],
  },
  {
    title: '',
    links: [
      { label: '', href: '/blog/' },
      { label: '', href: '#' },
      { label: 'Community', href: '#' },
      { label: 'Help Center', href: '#' },
    ],
  },
  
];
