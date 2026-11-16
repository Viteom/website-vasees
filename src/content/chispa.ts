export const chispa = {
  name: 'La Chispa',
  instagram: 'https://www.instagram.com/lachispa_podcast/',
  email: 'lachispapodcast@gmail.com',
  campaign: 'Cartografía de Pieles',
  author: 'Melissa Usme Botero',
  podcastUrl: 'https://www.youtube.com/watch?v=7Ort5R5x3uw&list=PLaG_NWeV7NTimxYWh-43EY51tzXed_r8X',
  podcastEmbed: 'https://www.youtube-nocookie.com/embed/7Ort5R5x3uw?list=PLaG_NWeV7NTimxYWh-43EY51tzXed_r8X&rel=0&playsinline=1&autoplay=1',
};

export type PodcastGuest = {
  name: string;
  image: string;
  position?: string;
};

export const podcastGuests: PodcastGuest[] = [
  { name: 'Natalia Hurtado', image: '/images/brands/chispa-guest-natalia-hurtado.webp', position: '50% 35%' },
  { name: 'Laura Polanía', image: '/images/brands/chispa-guest-laura-polania.webp', position: '50% 30%' },
  { name: 'Nancy Botero', image: '/images/brands/chispa-guest-nancy-botero.webp', position: '50% 38%' },
  { name: 'Jessie Bonder', image: '/images/brands/chispa-guest-jessie-bonder.webp', position: '50% 25%' },
  { name: 'Marce Conecta', image: '/images/brands/chispa-guest-marce-conecta.webp', position: '50% 30%' },
  { name: 'Juan Pablo Triana', image: '/images/brands/chispa-guest-juan-pablo-triana.webp', position: '50% 25%' },
  { name: 'Laura Espinosa', image: '/images/brands/chispa-guest-laura-espinosa.webp', position: '50% 30%' },
  { name: 'Alexandra Lándazuri', image: '/images/brands/chispa-guest-alexandra-landazuri.webp', position: '50% 30%' },
];

// Photography only from Cartografia_de_Pieles_Vasees (1).pdf.
// Campaign wording is based on the research-creation and Feministas Rodantes PDFs.
export const campaignPhotos = [
  { image: '/images/brands/cartografia-skin.webp', alt: 'Detalle fotográfico de los pliegues y las líneas de la piel', caption: 'La piel como territorio de memoria.', sourcePage: 2 },
  { image: '/images/brands/cartografia-city.webp', alt: 'Retrato de una persona mayor con una bufanda de colores junto a un muro de la ciudad', caption: 'Historias que también habitan la ciudad.', sourcePage: 4 },
  { image: '/images/brands/cartografia-encounter.webp', alt: 'Dos personas mayores sentadas junto a una ventana de madera', caption: 'Un encuentro. Más de una trayectoria.', sourcePage: 6 },
  { image: '/images/brands/cartografia-detail.webp', alt: 'Primer plano de la textura de la piel y de una mano junto al rostro', caption: 'Cada línea abre una pregunta.', sourcePage: 8 },
  { image: '/images/brands/cartografia-portrait.webp', alt: 'Retrato en primer plano de una persona mayor con la mano apoyada junto a su rostro', caption: 'Una mirada que guarda experiencias.', sourcePage: 10 },
];
