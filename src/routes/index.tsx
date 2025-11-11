import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/tanstack-react-start";
import { convexQuery } from "@convex-dev/react-query";
import { faker } from "@faker-js/faker";
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

  const addRandomTask = () => {
    const text = faker.string.uuid();
    addtask({ text });
  };

  const batchAddTasks = async () => {
    for (let i = 0; i < 200; i++) {
      addRandomTask();
      setTimeout(() => {}, 100);
    }
  };

  const deleteTask = useMutation(api.tasks.deleteTask);

  return (
    <div className="flex items-center justify-center flex-col gap-1 h-screen">
      <SignedIn>
        <div className="flex items-center h-[40%] justify-center flex-col gap-1">
          <p>You are signed in</p>
          <section className="absolute top-2 right-2">
            <UserButton />
          </section>
          <p>{user.user?.fullName}</p>
          <p>{user.user?.username}</p>
          <p>{user.user?.id}</p>
          <p>{user.user?.lastSignInAt?.toLocaleString()}</p>
          <button
            className="border cursor-pointer hover:bg-zinc-900 hover:text-zinc-50 transition-all duration-100 px-2 py-1 rounded"
            onClick={addRandomTask}
          >
            Add Task
          </button>
          <button
            className="border cursor-pointer hover:bg-zinc-900 hover:text-zinc-50 transition-all duration-100 px-2 py-1 rounded"
            onClick={batchAddTasks}
          >
            Batch Add
          </button>
        </div>

        <div className="h-[60%] w-full flex flex-wrap content-start gap-2 px-2 py-1 overflow-auto border bg-zinc-800">
          {data.length === 0 && <p className="text-zinc-50">No Data</p>}
          {data.map(({ _id, text }) => (
            <div
              key={_id}
              className="flex items-center justify-between text-zinc-50 gap-2 border w-36 h-12 rounded px-4 py-2"
            >
              <p className="flex flex-nowrap whitespace-nowrap overflow-auto w-18">
                {text}
              </p>
              <button
                onClick={() => deleteTask({ id: _id })}
                className="rounded-lg border-red-800 flex items-center justify-center border bg-red-500 text-zinc-50 w-6 h-6 transition-all duration-200 hover:scale-110"
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
