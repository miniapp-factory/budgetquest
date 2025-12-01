"use client";

import { title, description } from "@/lib/metadata";
import Game from "@/components/game";

export default function Home() {
  return (
    <main className="flex flex-col gap-3 place-items-center place-content-center px-4 grow">
      <Game />
    </main>
  );
}
