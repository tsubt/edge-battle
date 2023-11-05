import Header from "./components/Header";
import {
  ResponseType,
  Result,
  columnNames,
  groupBy,
  noCumScore,
  penaltyMap,
} from "./data/getData";
import { twMerge } from "tailwind-merge";
import Papa from "papaparse";

const getData = async () => {
  const url = process.env.DATA_URL;
  if (!url) {
    return;
  }

  const data = await fetch(url, { next: { revalidate: 60 } });
  if (!data.ok) return;

  const csvData = await data.text();

  //   parse with papaparse
  const res = await new Promise<ResponseType>((resolve) =>
    Papa.parse(csvData, {
      header: true,
      complete: (results) => {
        const data = results.data as { [key: string]: string }[];
        const d = data.map((d) => {
          let x = Object.keys(d).map((key) => {
            const newKey = columnNames[key] || key;
            return { [newKey]: d[key] };
          });
          x = Object.assign({}, ...x);
          const {
            timestamp,
            sessionLength,
            nRuined,
            nFull,
            releaseHandsfree,
            releaseRuined,
            releaseFull,
            releaseBallBusting,
            releaseAnal,
            releaseNipple,
            releaseTapping,
            eatCum,
            eatCum2,
            ...rest
          } = Result.parse(x);
          const releases = [
            { type: "Full", n: parseInt(releaseFull) },
            { type: "Ruined", n: parseInt(releaseRuined) },
            { type: "Handsfree", n: parseInt(releaseHandsfree) },
            { type: "BallBusting", n: parseInt(releaseBallBusting) },
            { type: "Anal", n: parseInt(releaseAnal) },
            { type: "Nipple", n: parseInt(releaseNipple) },
            { type: "Tapping", n: parseInt(releaseTapping) },
          ]
            .filter((r) => r.n > 0)
            .map((r) => Array(r.n).fill(r.type) as string[]);
          return {
            timestamp: new Date(timestamp),
            sessionLength: parseInt(sessionLength),
            ...rest,
            eatCum: eatCum !== "",
            releases: releases.flat(),
          };
        });

        resolve(d);
      },
    })
  );

  // group into contestants
  const battle = Array.from(groupBy(res, (x) => x.boy))
    .map(([key, val]) => ({
      boy: key,
      data: val,
      totalTime: val
        .map((v) => v.sessionLength)
        .reduce((total, current) => total + current, 0),
      penalty: val
        .map((v) =>
          v.releases
            .map(
              (r) => (penaltyMap.get(r) || 0) * (v.eatCum ? 1 : noCumScore(r))
            )
            .reduce((total, current) => total + current, 0)
        )
        .flat()
        .reduce((total, current) => total + current, 0),
    }))
    .map((x) => ({
      ...x,
      score: x.totalTime / x.penalty,
    }))
    .sort((a, b) => a.boy.localeCompare(b.boy));

  return battle;
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24 text-white bg-gradient-to-b from-black to-orange-950">
      <Header />
      <div className="grid grid-cols-3 mt-12 items-center justify-items-center w-[600px]">
        <div className="text-right text-4xl font-bold w-full">Achilles</div>
        <div className="text-lg w-24 flex justify-center">versus</div>
        <div className="text-4xl font-bold w-full">Tom</div>
      </div>

      <Results />

      <p className="mt-24">
        Score is 100 &times; edging time / sum of penalties.
      </p>

      <h5 className="text-lg mt-12">Rules</h5>
      <div className="text-sm text-center">
        <p>All edging must be supervised.</p>
        <p>
          Edgers are required to fill out the Google Form to record the session.
          Edgees will supply this before a session.
        </p>
        <p>
          The panalty for release (&ldquo;orgasm&rdquo;) depends on the type
          (see below).
        </p>
        <p>
          Not eating all of the cum results in a &times;2 multiplier to the
          penalty.
        </p>
      </div>

      <h5 className="text-lg mt-6">Penalties:</h5>
      <div className="grid grid-cols-4 md:grid-cols-7 gap-6 items-center flex-wrap mt-4">
        {Array.from(penaltyMap).map(([key, value]) => (
          <div key={key} className="flex flex-col gap-1 text-xs items-center">
            <Release release={key} cum={true} hover={false} />
            {key}
          </div>
        ))}
      </div>
    </main>
  );
}

const Results = async () => {
  const data = await getData();
  if (!data) return <>Loading ...</>;

  const achilles = data?.filter((x) => x.boy === "Achilles").at(0);
  const tom = data?.filter((x) => x.boy === "Tom").at(0);

  if (!achilles || !tom) return <>No data ...</>;

  // catch up
  const achillesScore = achilles.score,
    tomScore = tom.score;

  const ahead = achillesScore > tomScore ? "Achilles" : "Tom";
  const diff = Math.abs(achillesScore - tomScore);
  const tNeeded =
    diff * (ahead === "Achilles" ? tom.penalty : achilles.penalty);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 mt-6 items-center justify-evenly text-6xl font-bold text-red-500 w-[600px] justify-items-center w-full">
        <div className="text-right w-full">
          {Math.round(achilles.score * 100)}
        </div>
        <div className="text-sm text-white font-normal text-center w-24">
          score
        </div>
        <div className="w-full">{Math.round(tom.score * 100)}</div>
      </div>

      <div className="grid grid-cols-3 justify-items-center items-center justify-evenly text-3xl font-bold">
        <div className="text-right w-full">{achilles.totalTime}</div>
        <div className="text-sm font-normal whitespace-nowrap text-center w-36">
          minutes edging
        </div>
        <div className="w-full">{tom.totalTime}</div>
      </div>

      <div className="grid grid-cols-3 justify-items-center items-center justify-evenly text-3xl font-bold -mt-6">
        <div className="text-right w-full flex gap-1 items-center justify-end flex-wrap text-xs text-orange-400 font-normal">
          {achilles.data.map((d, i) => (
            <div key={i}>
              {i > 0 && "+ "}
              {d.sessionLength}
            </div>
          ))}
        </div>
        <div className="text-sm font-normal whitespace-nowrap text-center w-36"></div>
        <div className="text-right w-full flex gap-1 items-center justify-end flex-wrap text-xs text-orange-400 font-normal">
          {tom.data.map((d, i) => (
            <div key={i}>
              {i > 0 && "+ "}
              {d.sessionLength}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 justify-items-center items-center justify-evenly text-3xl font-bold">
        <div className="text-right w-full">
          {achilles.data
            .map((d) => d.releases.length)
            .reduce((x, c) => x + c, 0)}
        </div>
        <div className="text-sm font-normal whitespace-nowrap text-center w-36">
          releases (&ldquo;orgasms&rdquo;)
        </div>
        <div className="w-full">
          {tom.data.map((d) => d.releases.length).reduce((x, c) => x + c, 0)}
        </div>
      </div>

      <div className="grid grid-cols-3 justify-items-center items-center justify-evenly text-3xl font-bold">
        <div className="text-right w-full">{achilles.penalty}</div>
        <div className="text-sm font-normal whitespace-nowrap text-center w-36">
          penalty
        </div>
        <div className="w-full">{tom.penalty}</div>
      </div>

      <div className="grid grid-cols-3 justify-items-center items-center justify-evenly text-3xl font-bold -mt-5">
        <div className="text-right w-full flex gap-2 items-center justify-end text-black flex-wrap">
          {achilles.data.map((d) =>
            d.releases.map((r, i) => (
              <Release key={i} release={r} cum={d.eatCum} hover={true} />
            ))
          )}
        </div>
        <div className="text-sm font-normal whitespace-nowrap text-center w-36"></div>
        <div className="text-right w-full flex gap-2 items-center justify-start text-black flex-wrap">
          {tom.data.map((d) =>
            d.releases.map((r, i) => (
              <Release key={i} release={r} cum={d.eatCum} hover={true} />
            ))
          )}
        </div>
      </div>

      <div className="flex justify-center font-bold text-green-400 mt-6">
        {ahead === "Achilles" ? "Tom" : "Achilles"} needs to edge (without
        release) for {Math.ceil(tNeeded)} minutes to overtake {ahead}.
      </div>
    </div>
  );
};

const Release = ({
  release,
  cum,
  hover,
}: {
  release: string;
  cum: boolean;
  hover: boolean;
}) => {
  const penalty = penaltyMap.get(release) || 0;
  const noEatPenalty = penalty > 0 ? 2 : 0.5;
  return (
    <div
      className={twMerge(
        "h-5 w-5 rounded bg-white text-[0.5rem] flex items-center justify-center text-black font-bold relative group cursor-pointer",
        release === "Full" && "bg-red-100",
        release === "Ruined" && "bg-orange-100",
        release === "Handsfree" && "bg-green-100",
        release === "BallBusting" && "bg-blue-100",
        release === "Nipple" && "bg-pink-100",
        release === "Anal" && "bg-gray-100",
        release === "Tapping" && "bg-lime-100",
        !cum && "text-red-600"
      )}
    >
      {penalty > 0 && "+"}
      {penalty * (cum ? 1 : noEatPenalty)}
      {/* {hover && (
        <div className="absolute top-full translate-y-1 left-1/2 -translate-x-1/2 text-white w-auto whitespace-nowrap bg-black hidden group-hover:flex flex-col text-left px-3 py-1 gap-0">
          <div>Orgasm type: {release}</div>
          <div>Cum {!cum && "not"} eaten</div>
        </div>
      )} */}
    </div>
  );
};
