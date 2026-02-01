import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getPosts = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("blog_posts").order("desc").collect();
    },
});

export const getPostBySlug = query({
    args: { slug: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("blog_posts")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .first();
    },
});

export const createPost = mutation({
    args: {
        slug: v.string(),
        title: v.string(),
        description: v.string(),
        category: v.string(),
        image: v.string(),
        content: v.string(),
        external_links: v.optional(v.array(v.string())),
        keywords: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        // Basic check to prevent duplicate slugs
        const existing = await ctx.db
            .query("blog_posts")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .first();

        if (existing) {
            throw new Error("Slug already exists");
        }

        return await ctx.db.insert("blog_posts", {
            ...args,
            created_at: new Date().toISOString(),
        });
    },
});

export const updatePost = mutation({
    args: {
        id: v.id("blog_posts"),
        slug: v.optional(v.string()),
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        category: v.optional(v.string()),
        image: v.optional(v.string()),
        content: v.optional(v.string()),
        external_links: v.optional(v.array(v.string())),
        keywords: v.optional(v.array(v.string())),
        performance_data: v.optional(v.any()),
        last_analyzed_at: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        return await ctx.db.patch(id, updates);
    },
});

export const deletePost = mutation({
    args: { id: v.id("blog_posts") },
    handler: async (ctx, args) => {
        return await ctx.db.delete(args.id);
    },
});
