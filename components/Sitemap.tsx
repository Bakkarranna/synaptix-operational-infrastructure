import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { BlogPost } from '../src/types';

const Sitemap: React.FC = () => {
    const blogPosts = useQuery(api.blog.getPosts) || [];
    const posts = blogPosts; // Alias for compatibility

    // const [posts, setPosts] = useState<BlogPost[]>([]); // Removed
    // const [loading, setLoading] = useState(true); // Removed
    // const [error, setError] = useState<string | null>(null); // Removed

    /*
    useEffect(() => {
        // ... removed fetch
    }, []);
    */

    const baseUrl = 'https://synaptixstudio.com';
    const today = new Date().toISOString().split('T')[0];

    const staticPages = [
        { path: '/', priority: '1.0', changefreq: 'daily' },
        { path: '/ai-tools', priority: '0.8', changefreq: 'monthly' },
        { path: '/blog', priority: '0.8', changefreq: 'weekly' },
        { path: '/partner', priority: '0.7', changefreq: 'monthly' },
        { path: '/careers', priority: '0.7', changefreq: 'monthly' },
        { path: '/privacy', priority: '0.5', changefreq: 'yearly' },
        { path: '/terms', priority: '0.5', changefreq: 'yearly' },
    ];



    const staticPagesXml = staticPages.map(page => `
    <url>
        <loc>${baseUrl}/#${page.path === '/' ? '' : page.path}</loc>
        <lastmod>${today}</lastmod>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>`).join('');

    const blogPostsXml = posts.map(post => `
    <url>
        <loc>${baseUrl}/#/blog/${post.slug}</loc>
        <lastmod>${post.created_at ? new Date(post.created_at).toISOString().split('T')[0] : today}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>`).join('');

    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${staticPagesXml}
    ${blogPostsXml}
</urlset>`;

    // Render the XML content within a <pre> tag. This ensures that when the component
    // is rendered by React, the output is a valid text document that crawlers can parse.
    return <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{sitemapContent.trim()}</pre>;
};

export default Sitemap;