

import { createClient, PostgrestError } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jbmhpcvibiruqhbucwud.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpibWhwY3ZpYmlydXFoYnVjd3VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NTQ1MjksImV4cCI6MjA3MDAzMDUyOX0.i5WpBTDMTqlyId7rVf3Q5ll9mRhfzQ90LopP66JfALw';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Supabase URL or Anon Key is missing. Make sure to set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.");
}

const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

const supabaseRequest = async (table: string, data: Record<string, any>): Promise<void> => {
  console.log(`[Supabase Debug] Attempting to insert into table: "${table}"`);
  console.log('[Supabase Request] Submitted Data:', JSON.stringify(data, null, 2));
  
  const { error } = await supabase.from(table).insert(data as any);

  if (error) {
    // Provide a more helpful error message for common RLS issues.
    if (error.message.includes('violates row-level security policy')) {
      console.error(
        `[Supabase RLS Error] The insert on table "${table}" was blocked. ` +
        `Hint: You probably need to create an INSERT policy for anonymous users. ` +
        `Go to the Supabase SQL Editor and run: ` +
        `CREATE POLICY "Allow anon inserts on ${table}" ON public."${table}" FOR INSERT TO anon WITH CHECK (true);`
      );
    }
    console.error(`[Supabase Error] Failed to save to "${table}".`, error);
    throw new Error(`Supabase API Error: ${error.message}`);
  }

  console.log(`[Supabase Success] Data saved to table "${table}".`);
};

// --- Form Submission Functions ---

export const saveStrategyLead = (formData: { Name: string; Email: string; Website: string; BusinessDetails: string; AIResponse: string; }) =>
  supabaseRequest("AI_Strategy_Leads", formData);

export const saveContactLead = (formData: { Name: string; Email: string; Phone: string; Message: string; BookedDemo?: string | boolean }) =>
  supabaseRequest("Contact_Leads", { ...formData, BookedDemo: formData.BookedDemo === 'Yes' || formData.BookedDemo === true });

export const saveNewsletter = (formData: { Email: string }) =>
  supabaseRequest("Newsletter", formData);

export const saveChatLog = (formData: { Email: string; Chat: string; BookedDemo: string | boolean }) =>
  supabaseRequest("Chat_Assistant_Logs", { ...formData, BookedDemo: formData.BookedDemo === 'Yes' || formData.BookedDemo === true });

export const saveAuditLead = (formData: { Website: string; Report: string; }) =>
    supabaseRequest("Website_Audits", formData);

export const saveInternshipApplication = (formData: { Name: string; Email: string; SocialProfile: string; AppliedRole: string; CoverLetter: string; ResumeLink: string; }) =>
  supabaseRequest("Internship_Applications", formData);
    
export const saveAffiliateApplication = (formData: { Name: string; Email: string; SocialProfile: string; WorkedWithUs: string; AffiliateCode: string; }) =>
  supabaseRequest("Affiliate_Applications", formData);

export const saveReferral = (formData: { ReferrerName: string; ReferrerEmail: string; ReferredName: string; ReferredEmail: string; ReferredCompany: string; ReferralCode: string; }) =>
  supabaseRequest("Referrals", formData);

// --- Data Retrieval Functions ---

export const checkReferralCode = async (code: string): Promise<boolean> => {
    if (!code) return false;

    console.log(`[Supabase Debug] Checking referral code: "${code}"`);

    try {
        const affiliatePromise = (supabase
            .from('Affiliate_Applications') as any)
            .select('AffiliateCode', { count: 'exact', head: true })
            .eq('AffiliateCode', code);
            
        const referralPromise = (supabase
            .from('Referrals') as any)
            .select('ReferralCode', { count: 'exact', head: true })
            .eq('ReferralCode', code);

        const [affiliateResult, referralResult] = await Promise.all([
            affiliatePromise,
            referralPromise
        ]);
        
        if (affiliateResult.error) {
            throw affiliateResult.error;
        }
        if (referralResult.error) {
            throw referralResult.error;
        }

        const codeExists = (affiliateResult.count ?? 0) > 0 || (referralResult.count ?? 0) > 0;
        console.log(`[Supabase Success] Code "${code}" exists: ${codeExists}`);
        return codeExists;

    } catch (error: any) {
        console.error('[Supabase Error] Error checking referral code:', error.message);
        return false;
    }
};


// --- Blog Management Functions ---
export interface PerformanceData {
    summary: string;
    metrics: { name: string; value: string; insight: string; }[];
    recommendations: { recommendation: string; priority: 'High' | 'Medium' | 'Low'; }[];
}

export interface BlogPost {
  id?: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  image: string;
  content: string;
  keywords?: string;
  externalLinks?: { platform: string; url: string; text: string }[];
  created_at?: string;
  performance_data?: PerformanceData | null;
  last_analyzed_at?: string | null;
}

interface BlogPostForDb {
    id?: number;
    slug: string;
    title: string;
    description: string;
    category: string;
    image: string;
    content: string;
    keywords?: string;
    external_links: string;
    created_at?: string;
    performance_data?: PerformanceData | null;
    last_analyzed_at?: string | null;
}

// Internal helper to ensure external_links is always a valid array
const sanitizePost = (post: BlogPostForDb): BlogPost => {
    let externalLinks: { platform: string; url: string; text: string }[] = [];
    if (post.external_links && typeof post.external_links === 'string') {
        try {
            const parsed = JSON.parse(post.external_links);
            if (Array.isArray(parsed)) {
                externalLinks = parsed;
            } else {
                console.warn(`external_links for post ID ${post.id} was not an array, defaulting to empty.`);
            }
        } catch (e) {
            console.error(`Failed to parse external_links for post ID ${post.id}:`, post.external_links);
        }
    }

    return {
        id: post.id,
        slug: post.slug,
        title: post.title,
        description: post.description,
        category: post.category,
        image: post.image,
        content: post.content,
        keywords: post.keywords || '',
        externalLinks: externalLinks,
        created_at: post.created_at,
        performance_data: post.performance_data,
        last_analyzed_at: post.last_analyzed_at,
    };
}


export const getBlogPosts = async (): Promise<BlogPost[]> => {
    console.log('[Supabase] Fetching all blog posts...');
    const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[Supabase Error] Failed to fetch blog posts:', error);
        throw new Error(`Failed to fetch blog posts: ${error.message} (Hint: ${error.hint})`);
    }
    
    if (!data) {
        return [];
    }
    
    console.log(`[Supabase Success] Fetched ${data.length} blog posts.`);
    return (data as BlogPostForDb[]).map(sanitizePost);
};

export const saveBlogPost = async (post: BlogPost): Promise<BlogPost> => {
    console.log(`[Supabase] Saving blog post with slug: "${post.slug}"`);

    const postForDb: { [key: string]: any; } = {
        slug: post.slug,
        title: post.title,
        description: post.description,
        category: post.category,
        image: post.image,
        content: post.content,
        keywords: post.keywords || '',
        external_links: JSON.stringify(post.externalLinks || []),
        performance_data: post.performance_data || null,
        last_analyzed_at: post.last_analyzed_at || null,
    };

    if (post.id) {
        postForDb.id = post.id;
    }
    
    const { data, error } = await supabase
        .from('blog_posts')
        .upsert([postForDb] as any, { onConflict: 'slug' })
        .select()
        .single();
    
    if (error) {
        console.error('[Supabase Error] Failed to save blog post:', error);
        throw new Error(`Failed to save post: ${error.message} (Hint: ${error.hint})`);
    }
    console.log('[Supabase Success] Blog post saved successfully.');

    if (!data) {
        throw new Error('Supabase did not return data after saving the post.');
    }

    return sanitizePost(data as BlogPostForDb);
};

export const updatePostPerformanceData = async (postId: number, performanceData: PerformanceData): Promise<BlogPost> => {
    console.log(`[Supabase] Updating performance data for post ID: ${postId}`);
    const { data, error } = await supabase
        .from('blog_posts')
        .update({
            performance_data: performanceData,
            last_analyzed_at: new Date().toISOString(),
        })
        .eq('id', postId)
        .select()
        .single();

    if (error) {
        console.error('[Supabase Error] Failed to update performance data:', error);
        throw new Error(`Failed to update performance data: ${error.message}`);
    }
     console.log('[Supabase Success] Performance data updated successfully.');
    if (!data) {
        throw new Error('Supabase did not return data after updating performance data.');
    }
    return sanitizePost(data as BlogPostForDb);
};

export const deleteBlogPost = async (postId: number): Promise<void> => {
    console.log(`[Supabase] Deleting blog post with ID: "${postId}"`);
    const { data, error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId)
        .select()
        .single();

    if (error) {
        console.error('[Supabase Error] Failed to delete blog post:', error);
        throw new Error(`Failed to delete post: ${error.message} (Hint: ${error.hint})`);
    }

    if (!data) {
        const errorMessage = `Deletion failed: No post found with ID ${postId}. It may have been deleted already.`;
        console.warn(`[Supabase Warning] ${errorMessage}`);
        throw new Error(errorMessage);
    }

    console.log('[Supabase Success] Blog post deleted successfully:', data);
};
