"use client";

import { useState } from "react";
import Header from "./components/Header";

import Papa from "papaparse";

type Orgasm = {
  type: string;
  score: number;
};

type Score = {
  score: number;
  time: number;
  orgasms: Orgasm[];
};

type Results = {
  achilles: Score;
  tom: Score;
};

async function getData({ setter }: { setter: Function }) {
  const url = "";

  Papa.parse(url, {
    download: true,
    complete: (results) => {
      const data = results.data;
      // const achilles = data.filter((d) => d[1] == "Achilles");
      // console.log(achilles);
    },
  });
}

export default function Home() {
  const [results, setResults] = useState<Results>();

  getData({ setter: setResults });

  return (
    <main className="flex min-h-screen flex-col items-center p-24 text-white bg-gradient-to-b from-black to-orange-950">
      <Header />

      <div className="flex gap-24  mt-12 items-center">
        <div className="flex-1 text-right text-5xl font-bold">Achilles</div>
        <div className="text-lg">versus</div>
        <div className="flex-1 text-5xl font-bold">Tom</div>
      </div>
    </main>
  );
}
