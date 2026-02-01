import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    blog_posts: defineTable({
        slug: v.string(),
        title: v.string(),
        description: v.string(),
        category: v.string(),
        image: v.string(),
        content: v.string(),
        external_links: v.optional(v.any()),
        keywords: v.optional(v.array(v.string())),
        created_at: v.string(), // ISO date string
        performance_data: v.optional(v.any()),
        last_analyzed_at: v.optional(v.string()),
    }).index("by_slug", ["slug"]),

    contact_submissions: defineTable({
        name: v.string(),
        email: v.string(),
        phone: v.optional(v.string()),
        message: v.string(),
        service_interest: v.optional(v.string()),
        submitted_at: v.string(),
    }),

    ai_strategy_requests: defineTable({
        name: v.optional(v.string()),
        email: v.string(),
        website: v.string(),
        business_needs: v.optional(v.string()),
        ai_response: v.optional(v.string()),
        submitted_at: v.string(),
    }),

    demo_requests: defineTable({
        email: v.string(),
        name: v.optional(v.string()),
        submitted_at: v.string(),
    }),

    newsletter_subscriptions: defineTable({
        email: v.string(),
        subscribed_at: v.string(),
    }),

    referrals: defineTable({
        referrer_name: v.string(),
        referrer_email: v.string(),
        referred_name: v.string(),
        referred_email: v.string(),
        referred_company: v.optional(v.string()), // Optional in form? check
        referral_code: v.string(),
        submitted_at: v.string(),
    }),

    internship_applications: defineTable({
        name: v.string(),
        email: v.string(),
        social_profile: v.string(),
        role: v.string(),
        cover_letter: v.string(),
        resume_link: v.string(),
        submitted_at: v.string(),
    }),

    auditor_requests: defineTable({
        website: v.string(),
        report: v.string(), // JSON string
        email: v.optional(v.string()), // Optional in form
        submitted_at: v.string(),
    }),

    affiliate_applications: defineTable({
        name: v.string(),
        email: v.string(),
        social_profile: v.string(),
        worked_with_us: v.string(), // "Yes" | "No"
        affiliate_code: v.string(),
        submitted_at: v.string(),
    }),
});
