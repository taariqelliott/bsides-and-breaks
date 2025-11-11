import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tasks").collect();
  },
});

export const createTask = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    const newTaskId = await ctx.db.insert("tasks", { text: args.text });
    return newTaskId;
  },
});

export const deleteTask = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const newTaskId = await ctx.db.delete(args.id);
    return newTaskId;
  },
});
