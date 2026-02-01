import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const submitContact = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        phone: v.optional(v.string()),
        message: v.string(),
        service_interest: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("contact_submissions", {
            ...args,
            submitted_at: new Date().toISOString(),
        });
    },
});

export const submitStrategy = mutation({
    args: {
        name: v.optional(v.string()),
        email: v.string(),
        website: v.string(),
        business_needs: v.optional(v.string()),
        ai_response: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("ai_strategy_requests", {
            ...args,
            submitted_at: new Date().toISOString(),
        });
    },
});

export const submitDemo = mutation({
    args: {
        email: v.string(),
        name: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("demo_requests", {
            ...args,
            submitted_at: new Date().toISOString(),
        });
    },
});

export const submitNewsletter = mutation({
    args: {
        email: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("newsletter_subscriptions", {
            ...args,
            subscribed_at: new Date().toISOString(),
        });
    },
});

export const submitReferral = mutation({
    args: {
        referrerName: v.string(),
        referrerEmail: v.string(),
        referredName: v.string(),
        referredEmail: v.string(),
        referredCompany: v.optional(v.string()),
        referralCode: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("referrals", {
            referrer_name: args.referrerName,
            referrer_email: args.referrerEmail,
            referred_name: args.referredName,
            referred_email: args.referredEmail,
            referred_company: args.referredCompany,
            referral_code: args.referralCode,
            submitted_at: new Date().toISOString(),
        });
    },
});

export const submitInternship = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        socialProfile: v.string(),
        appliedRole: v.string(),
        coverLetter: v.string(),
        resumeLink: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("internship_applications", {
            name: args.name,
            email: args.email,
            social_profile: args.socialProfile,
            role: args.appliedRole,
            cover_letter: args.coverLetter,
            resume_link: args.resumeLink,
            submitted_at: new Date().toISOString(),
        });
    },
});

export const submitAuditor = mutation({
    args: {
        website: v.string(),
        report: v.string(),
        email: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("auditor_requests", {
            website: args.website,
            report: args.report,
            email: args.email,
            submitted_at: new Date().toISOString(),
        });
    },
});

export const submitAffiliate = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        socialProfile: v.string(),
        workedWithUs: v.string(),
        affiliateCode: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("affiliate_applications", {
            name: args.name,
            email: args.email,
            social_profile: args.socialProfile,
            worked_with_us: args.workedWithUs,
            affiliate_code: args.affiliateCode,
            submitted_at: new Date().toISOString(),
        });
    },
});

export const checkReferralCode = query({
    args: { code: v.string() },
    handler: async (ctx, args) => {
        const affiliate = await ctx.db
            .query("affiliate_applications")
            .filter((q) => q.eq(q.field("affiliate_code"), args.code))
            .first();
        return !!affiliate;
    },
});
