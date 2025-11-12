import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("songs").collect();
  },
});

export const createSong = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    const newSongId = await ctx.db.insert("songs", { text: args.text });
    return newSongId;
  },
});

export const deleteSong = mutation({
  args: { id: v.id("songs") },
  handler: async (ctx, args) => {
    const newSongId = await ctx.db.delete(args.id);
    return newSongId;
  },
});
