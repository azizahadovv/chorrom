import { useEffect } from 'react';
import { useSystemSettings } from '@/hooks/useSystemSettings';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  noindex?: boolean;
  nofollow?: boolean;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

export function useSEO({
  title,
  description,
  keywords,
  noindex = false,
  nofollow = false,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
}: SEOProps) {
  const { settings, getSEOTitle, getSEODescription, getPrimaryDomain } = useSystemSettings();

  useEffect(() => {
    // Generate title with fallback to system settings
    // Sahifa sarlavhalari kontentda to'liq yozilgan ("Katalog — CHORROM"), shuning uchun qo'shimcha qo'shilmaydi.
    const pageTitle = title || getSEOTitle();
    
    document.title = pageTitle;

    // Helper to update or create meta tag
    const updateMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      
      if (content) {
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute(attr, name);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      } else if (meta) {
        meta.remove();
      }
    };

    // Use provided description or fallback to system settings
    const metaDescription = description || getSEODescription();
    if (metaDescription) {
      updateMeta('description', metaDescription);
    }

    if (keywords) {
      updateMeta('keywords', keywords);
    }

    // Robots meta
    const robotsContent = [
      noindex ? 'noindex' : 'index',
      nofollow ? 'nofollow' : 'follow',
    ].join(', ');
    updateMeta('robots', robotsContent);

    // Canonical URL - use primary domain from settings
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    const baseUrl = getPrimaryDomain();
    const canonicalUrl = canonical || (baseUrl + (window.location.pathname === '/' ? '' : window.location.pathname));
    
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // Open Graph tags
    updateMeta('og:title', ogTitle || pageTitle, true);
    updateMeta('og:description', ogDescription || metaDescription, true);
    updateMeta('og:url', canonicalUrl, true);
    if (ogImage) {
      updateMeta('og:image', ogImage, true);
    }
    updateMeta('og:type', 'website', true);
    updateMeta('og:site_name', settings?.site_name || 'CHORROM', true);

    // Twitter Card
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', ogTitle || pageTitle);
    updateMeta('twitter:description', ogDescription || metaDescription);
    if (ogImage) {
      updateMeta('twitter:image', ogImage);
    }

    // Cleanup function to reset on unmount
    return () => {
      // Don't remove meta tags on cleanup, just leave them for the next page
    };
  }, [title, description, keywords, noindex, nofollow, canonical, ogTitle, ogDescription, ogImage, settings]);
}

export default useSEO;
