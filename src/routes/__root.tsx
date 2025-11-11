import { ClerkProvider, useAuth } from "@clerk/tanstack-react-start";
import { auth } from "@clerk/tanstack-react-start/server";
import type { ConvexQueryClient } from "@convex-dev/react-query";
import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { createServerFn } from "@tanstack/start";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import type * as React from "react";

import appCss from "../styles.css?url";

/* Server-side function to get Clerk auth info for Convex */
const fetchClerkAuth = createServerFn({ method: "GET" }).handler(async () => {
	try {
		const authResult = await auth();
		if (!authResult) return { userId: null, token: null };

		const token = await authResult
			.getToken({ template: "convex" })
			.catch(() => null);
		return { userId: authResult.userId ?? null, token };
	} catch (err) {
		console.error("fetchClerkAuth error:", err);
		return { userId: null, token: null };
	}
});

/* Root route setup with Clerk and Convex context */
export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
	convexClient: ConvexReactClient;
	convexQueryClient: ConvexQueryClient;
}>()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: "TanStack + Clerk + Convex" },
		],
		links: [{ rel: "stylesheet", href: appCss }],
	}),

	beforeLoad: async (ctx) => {
		const authData = await fetchClerkAuth();
		const { userId, token } = authData ?? { userId: null, token: null };

		// Set Clerk token for Convex server queries during SSR
		if (token) {
			ctx.context.convexQueryClient.serverHttpClient?.setAuth(token);
		}

		return { userId, token };
	},

	shellComponent: RootDocument,
});

/* Root HTML structure and providers */
function RootDocument({ children }: { children: React.ReactNode }) {
	const convexUrl = import.meta.env.VITE_CONVEX_URL;

	return (
		<ClerkProvider>
			<ConvexProviderWithClerk
				client={new ConvexReactClient(convexUrl)}
				useAuth={useAuth}
			>
				<html lang="en">
					<head>
						<HeadContent />
					</head>
					<body>
						{children}
						<TanStackDevtools
							config={{ position: "bottom-right" }}
							plugins={[
								{
									name: "TanStack Router",
									render: <TanStackRouterDevtoolsPanel />,
								},
							]}
						/>
						<Scripts />
					</body>
				</html>
			</ConvexProviderWithClerk>
		</ClerkProvider>
	);
}
