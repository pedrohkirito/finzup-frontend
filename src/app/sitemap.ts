import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date('2026-11-13');

  return [
    {
      url: 'https://finzup.com.br',
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://finzup.com.br/login',
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: 'https://finzup.com.br/politica-de-privacidade',
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: 'https://finzup.com.br/termos-de-uso',
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
}
