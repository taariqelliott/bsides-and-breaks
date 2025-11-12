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
import { ChangeEvent, useState } from "react";

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
  const deleteSongMutation = useMutation(api.songs.deleteSong);
  const addRandomSongMutation = useMutation(api.songs.addSong);
  const { data } = useSuspenseQuery(convexQuery(api.songs.get, {}));
  const { userId, fullName, lastSignInAt, username } = Route.useLoaderData();
  const { user } = useUser();

  data.sort((a, b) =>
    a.albumArtist.toLowerCase().localeCompare(b.albumArtist.toLowerCase()),
  );
  const [currentUserName, setCurrentUserName] = useState(username);

  const updateUsername = async () => {
    try {
      await user?.update({ username: currentUserName });
    } catch (error) {
      console.error(error);
    }
  };

  const addRandomSong = () => {
    const songName = faker.music.songName();
    const albumArtist = faker.music.artist();
    const albumGenre = faker.music.genre();
    const albumName = faker.music.album();
    addRandomSongMutation({ albumArtist, albumGenre, albumName, songName });
  };

  const batchAddSongs = async () => {
    for (let i = 0; i < 10; i++) {
      addRandomSong();
      setTimeout(() => {}, 200);
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

          <section className="flex items-center gap-2 justify-center flex-col">
            <input
              type="text"
              className="px-2 py-1 rounded-lg shadow border-zinc-400 border-2"
              placeholder="Add a new username..."
              onChange={(event: ChangeEvent) => {
                const target = event.currentTarget as HTMLInputElement;
                setCurrentUserName(target.value);
              }}
            />
            <button
              onClick={updateUsername}
              className="bg-zinc-800 w-30 hover:bg-zinc-900 text-white font-mono py-2 px-4 rounded-lg transition-all duration-100"
            >
              Update
            </button>
          </section>
          <div className="flex flex-col gap-2 mb-4">
            <p className="text-lg font-bold text-zinc-500">{fullName}</p>
            <p className="text-zinc-500 text-sm">{username}</p>
            <p className="text-zinc-500 text-sm">{userId}</p>
            <p className="text-zinc-500 text-sm">{lastSignInAt}</p>
          </div>
          <button
            className="bg-zinc-800 w-30 hover:bg-zinc-900 text-white font-bold py-2 px-4 rounded-lg transition-all duration-100"
            onClick={addRandomSong}
          >
            Add Song
          </button>
          <button
            className="bg-zinc-500 w-30 hover:bg-zinc-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-100"
            onClick={batchAddSongs}
          >
            Batch Add
          </button>
        </div>

        <div className="h-full w-full flex flex-col gap-2 p-4 overflow-auto border bg-zinc-800">
          {data.length === 0 && (
            <p className="text-center text-lg font-mono text-zinc-50">
              No Songs
            </p>
          )}
          {data.map(({ _id, songName, albumArtist, albumGenre, albumName }) => (
            <div
              key={_id}
              className="flex items-center flex-col justify-between p-4 gap-2 rounded-md shadow-md transition-all duration-200 hover:shadow-lg"
            >
              <p className="text-zinc-50 grow overflow-auto">
                Artist: {albumArtist}
              </p>
              <p className="text-zinc-50 grow overflow-auto">
                Album: {albumName}
              </p>
              <p className="text-zinc-50 grow overflow-auto">
                Hit Song: {songName}
              </p>
              <p className="text-zinc-50 grow overflow-auto">
                Genre: {albumGenre}
              </p>
              <button
                onClick={() => deleteSongMutation({ id: _id })}
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
