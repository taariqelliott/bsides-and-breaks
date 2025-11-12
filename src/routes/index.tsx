import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/tanstack-react-start";
import { auth, clerkClient } from "@clerk/tanstack-react-start/server";
import { convexQuery } from "@convex-dev/react-query";
import { faker } from "@faker-js/faker";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { api } from "convex/_generated/api";
import { useMutation } from "convex/react";

const authStateFn = createServerFn({ method: "GET" }).handler(async () => {
  const { isAuthenticated, userId } = await auth();
  if (!isAuthenticated) {
    throw redirect({
      to: "/sign-in/$",
    });
  }
  const user = await clerkClient().users.getUser(userId);
  return {
    userId,
    username: user?.username,
    lastSignInAt: user?.lastSignInAt,
    fullName: user?.fullName,
  };
});

export const Route = createFileRoute("/")({
  component: Home,
  beforeLoad: () => authStateFn(),
  loader: async ({ context }) => {
    return {
      userId: context.userId,
      lastSignInAt: context.lastSignInAt,
      username: context.username,
      fullName: context.fullName,
    };
  },
});

function Home() {
  const deleteTaskMutation = useMutation(api.tasks.deleteTask);
  const addRandomTaskMutation = useMutation(api.tasks.createTask);
  const { data } = useSuspenseQuery(convexQuery(api.tasks.get, {}));
  const { userId, fullName, lastSignInAt, username } = Route.useLoaderData();
  const { user } = useUser();

  const updateUsername = async () => {
    try {
      await user?.update({ username: "mr_elliott" });
    } catch (error) {
      console.error(error);
    }
  };

  const addRandomTask = () => {
    const text = faker.string.uuid();
    addRandomTaskMutation({ text });
  };

  const batchAddTasks = async () => {
    for (let i = 0; i < 20; i++) {
      addRandomTask();
      setTimeout(() => {}, 300);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <SignedIn>
        <div className="w-full flex flex-col items-center gap-4 mb-8">
          <h1 className="text-lg font-bold text-zinc-50">Dashboard</h1>
          <p className="text-zinc-700 text-sm">You are signed in</p>
          <section className="absolute bottom-2 left-2">
            <UserButton />
          </section>
          <button
            onClick={updateUsername}
            className="bg-zinc-800 w-30 hover:bg-zinc-900 text-white font-bold py-2 px-4 rounded-lg transition-all duration-100"
          >
            update username
          </button>
          <div className="flex flex-col gap-2 mb-4">
            <p className="text-lg font-bold text-zinc-500">{fullName}</p>
            <p className="text-zinc-500 text-sm">{username}</p>
            <p className="text-zinc-500 text-sm">{userId}</p>
            <p className="text-zinc-500 text-sm">{lastSignInAt}</p>
          </div>
          <button
            className="bg-zinc-800 w-30 hover:bg-zinc-900 text-white font-bold py-2 px-4 rounded-lg transition-all duration-100"
            onClick={addRandomTask}
          >
            Add Task
          </button>
          <button
            className="bg-zinc-500 w-30 hover:bg-zinc-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-100"
            onClick={batchAddTasks}
          >
            Batch Add
          </button>
        </div>

        <div className="h-full w-full flex flex-col gap-2 p-4 overflow-auto border bg-zinc-800">
          {data.length === 0 && (
            <p className="text-center text-lg font-bold text-zinc-50">
              No Data
            </p>
          )}
          {data.map(({ _id, text }) => (
            <div
              key={_id}
              className="flex items-center justify-between p-4 gap-2 rounded-md shadow-md transition-all duration-200 hover:shadow-lg"
            >
              <p className="text-zinc-50 grow overflow-auto">{text}</p>
              <button
                onClick={() => deleteTaskMutation({ id: _id })}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-all duration-200"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </SignedIn>
      <SignedOut>
        <p className="text-zinc-500 text-sm">You are signed out</p>
        <SignInButton />
      </SignedOut>
    </div>
  );
}
