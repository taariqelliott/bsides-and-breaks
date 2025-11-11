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

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { data } = useSuspenseQuery(convexQuery(api.tasks.get, {}));
  const user = useUser();
  console.log(user.user?.id);

  return (
    <div>
      <h1>Index Route</h1>
      <SignedIn>
        <p>You are signed in</p>
        <UserButton />

        <div>
          {data.map(({ _id, text }) => (
            <div key={_id}>{text}</div>
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
