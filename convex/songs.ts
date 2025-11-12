import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("songs").collect();
  },
});

export const addSong = mutation({
  args: {
    albumArtist: v.string(),
    albumName: v.string(),
    albumGenre: v.string(),
    songName: v.string(),
  },
  handler: async (ctx, args) => {
    const newSongId = await ctx.db.insert("songs", {
      albumArtist: args.albumArtist,
      albumName: args.albumName,
      albumGenre: args.albumGenre,
      songName: args.songName,
    });
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
