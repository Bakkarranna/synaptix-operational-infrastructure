export interface PerformanceData {
    summary: string;
    metrics: { name: string; value: string; insight: string; }[];
    recommendations: { recommendation: string; priority: 'High' | 'Medium' | 'Low'; }[];
}

export interface BlogPost {
    id?: string | number;
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
    // Convex specific (mapped or optional)
    _id?: string;
    _creationTime?: number;
}
