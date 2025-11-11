import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/tanstack-react-start";
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { useMutation } from "convex/react";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { data } = useSuspenseQuery(convexQuery(api.tasks.get, {}));
  const user = useUser();
  console.log(user.user?.id);
  const addtask = useMutation(api.tasks.createTask);

  const runRandomTask = () => {
    let letters = "abcdefghijklmnopqrstuvwxyz";
    let text = "";
    while (text.length < 10) {
      text += letters[Math.floor(Math.random() * letters.length)];
    }
    addtask({ text });
  };

  const deleteTask = useMutation(api.tasks.deleteTask);

  return (
    <div className="flex items-center justify-center flex-col gap-1 h-screen">
      <SignedIn>
        <div className="flex items-center h-[40%] justify-center flex-col gap-1">
          <h1>Index Route</h1>
          <p>You are signed in</p>
          <UserButton />
          <p>{user.user?.fullName}</p>
          <p>{user.user?.firstName}</p>
          <p>{user.user?.lastName}</p>
          <p>{user.user?.id}</p>
          <p>{user.user?.lastSignInAt?.toLocaleString()}</p>
          <button className="border px-2 py-1 rounded" onClick={runRandomTask}>
            Add Task
          </button>
        </div>

        <div className="h-[60%] w-full mx-auto flex flex-wrap content-start gap-2 px-2 py-1 overflow-auto border bg-zinc-900">
          {data.map(({ _id, text }) => (
            <div
              key={_id}
              className="flex items-center justify-between text-zinc-50 gap-2 border w-48 h-12 rounded px-4 py-2"
            >
              <p>{text}</p>
              <button
                onClick={() => deleteTask({ id: _id })}
                className="rounded border-red-700 flex items-center justify-center border bg-red-500 text-zinc-50 w-6 h-6 transition-all duration-200 hover:scale-110"
              >
                X
              </button>
            </div>
          ))}
        </div>
      </SignedIn>
      <SignedOut>
        <p>You are signed out</p>
        <SignInButton />
      </SignedOut>
    </div>
  );
}
