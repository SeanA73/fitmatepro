import { Helmet } from 'react-helmet-async';

export const SITE_NAME = 'FitMatePro';
export const SITE_ORIGIN = 'https://fitmatepro.com';
const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/og-image.jpg`;

interface SeoProps {
  /** 50-60 characters. Shown as the search result headline. */
  title: string;
  /** 140-160 characters, written for a human deciding whether to click. */
  description: string;
  /**
   * Root-relative path for this route, e.g. "/pricing". Combined with
   * SITE_ORIGIN into the absolute canonical URL. Absolute is required: a
   * relative canonical is resolved against the current host, so a staging or
   * preview deploy would declare itself canonical and compete with production.
   */
  path: string;
  /** Overrides the shared social card. */
  image?: string;
  /** Set on pages that must not appear in search results. */
  noindex?: boolean;
}

/**
 * Per-route document metadata.
 *
 * Titles, descriptions, canonicals and og: tags for page-varying values live
 * here rather than in index.html, because index.html can only hold one set and
 * every route was therefore claiming to be the homepage — same title, same
 * description, and an og:url of https://fitmatepro.com regardless of the page
 * being shared.
 *
 * IMPORTANT LIMITATION: these tags are written by JavaScript after the bundle
 * executes. Googlebot renders JS and will see them; the social crawlers do not.
 * facebookexternalhit and Twitterbot read the raw HTML response, so until
 * prerendering ships they still see only the static fallbacks left in
 * index.html. This component is a prerequisite for per-route social previews,
 * not a solution on its own.
 */
export const Seo = ({ title, description, path, image, noindex }: SeoProps) => {
  const canonical = `${SITE_ORIGIN}${path}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex, follow" />}

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:image" content={image ?? DEFAULT_OG_IMAGE} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image ?? DEFAULT_OG_IMAGE} />
    </Helmet>
  );
};

export default Seo;
