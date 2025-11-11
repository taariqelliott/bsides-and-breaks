import { SignUp } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sign-up/$")({
  component: Page,
});

function Page() {
  return (
    <main className="flex items-center justify-center min-h-screen">
      <SignUp />
    </main>
  );
}
