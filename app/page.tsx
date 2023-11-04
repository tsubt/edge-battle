import Header from "./components/Header";
import { getData } from "./data/getData";
import { penaltyMap } from "./data/getData";
import { twMerge } from "tailwind-merge";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24 text-white bg-gradient-to-b from-black to-orange-950">
      <Header />
      <div className="grid grid-cols-2 gap-24 mt-12 items-center">
        <div className="text-right text-4xl font-bold">Achilles</div>
        <div className="text-4xl font-bold">Tom</div>
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
          The panalty for release ("orgasm") depends on the type (see below).
        </p>
        <p>
          Not eating all of the cum results in a &times;2 multiplier to the
          penalty.
        </p>
      </div>

      <h5 className="text-lg mt-6">Penalties:</h5>
      <div className="flex gap-6 items-center flex-wrap mt-4">
        {Array.from(penaltyMap).map(([key, value]) => (
          <div key={key} className="flex flex-col gap-1 text-xs items-center">
            <Release release={key} cum={true} />
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

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-24 mt-6 items-center justify-evenly text-6xl font-bold text-red-500">
        <div className="text-right ">{Math.round(achilles.score * 100)}</div>
        <div className="">{Math.round(tom.score * 100)}</div>
      </div>

      <div className="grid grid-cols-2 gap-24 items-center justify-evenly text-3xl font-bold">
        <div className="text-right">{achilles.totalTime} mins</div>
        <div className="">{tom.totalTime} mins</div>
      </div>

      <div className="grid grid-cols-2 gap-24 items-center justify-evenly text-3xl font-bold">
        <div className="text-right flex gap-2 items-center justify-end text-black flex-wrap">
          {achilles.data.map((d) =>
            d.releases.map((r, i) => (
              <Release key={i} release={r} cum={d.eatCum} />
            ))
          )}
        </div>
        <div className="text-right flex gap-2 items-center justify-start text-black flex-wrap">
          {tom.data.map((d) =>
            d.releases.map((r, i) => (
              <Release key={i} release={r} cum={d.eatCum} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const Release = ({ release, cum }: { release: string; cum: boolean }) => {
  const penalty = penaltyMap.get(release) || 0;
  const noEatPenalty = penalty > 0 ? 2 : 0.5;
  return (
    <div
      className={twMerge(
        "h-5 w-5 rounded-full bg-white text-xs flex items-center justify-center",
        release === "Full" && "bg-red-600 text-white",
        release === "Ruined" && "bg-orange-600",
        release === "Handsfree" && "bg-green-600",
        release === "BallBusting" && "bg-blue-600",
        release === "Nipple" && "bg-pink-500",
        release === "Anal" && "bg-gray-600",
        release === "Tapping" && "bg-lime-600",
        !cum && "border-2"
      )}
    >
      {penalty * (cum ? 1 : noEatPenalty)}
    </div>
  );
};
