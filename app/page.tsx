import clsx from "clsx";
import Header from "./components/Header";
import { getData } from "./data/getData";
import { penaltyMap } from "./data/getData";

// async function getData() {
//   const res = await fetch("http://localhost:3000/data");
//   console.log(res);
//   if (!res.ok) {
//     throw new Error("Failed to get data");
//   }
//   // console.log(res.json());
//   // return res.json();
// }

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24 text-white bg-gradient-to-b from-black to-orange-950">
      <Header />
      <div className="grid grid-cols-2 gap-24 mt-12 items-center">
        <div className="text-right text-4xl font-bold">Achilles</div>
        <div className="text-4xl font-bold">Tom</div>
      </div>

      <Results />
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
        <div className="text-right ">
          {Math.round(achilles.score * 100) / 100}
        </div>
        <div className="">{Math.round(tom.score * 100) / 100}</div>
      </div>

      <div className="grid grid-cols-2 gap-24 items-center justify-evenly text-3xl font-bold">
        <div className="text-right">{achilles.totalTime} mins</div>
        <div className="">{tom.totalTime} mins</div>
      </div>

      <div className="grid grid-cols-2 gap-24 items-center justify-evenly text-3xl font-bold">
        <div className="text-right flex gap-2 items-center justify-end text-black">
          {achilles.data
            .map((d) => d.releases)
            .flat()
            .map((r, i) => (
              <Release key={i} release={r} />
            ))}
        </div>
        <div className="text-right flex gap-2 items-center justify-start text-black">
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
  return (
    <div
      className={clsx(
        "h-5 w-5 rounded-full bg-white text-xs flex items-center justify-center",
        release === "Full" && "bg-red-600 text-white",
        release === "Ruined" && "bg-orange-600",
        release === "Handsfree" && "bg-green-600",
        release === "BallBusting" && "bg-blue-600",
        release === "Nipple" && "bg-pink-500",
        release === "Anal" && "bg-gray-600",
        release === "Tapping" && "bg-lime-600",
        cum && "border-2"
      )}
    >
      {(penaltyMap.get(release) || 0) * (cum ? 1 : 2)}
    </div>
  );
};
