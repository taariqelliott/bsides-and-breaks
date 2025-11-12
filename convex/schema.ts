import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Other tables here...
  songs: defineTable({
    albumArtist: v.string(),
    albumName: v.string(),
    albumGenre: v.string(),
    songName: v.string(),
  }),
});
