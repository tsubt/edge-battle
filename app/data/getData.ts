import { https } from "follow-redirects";
import { createWriteStream, createReadStream } from "fs";
import { cache } from "react";

import Papa from "papaparse";
import { z } from "zod";

const columnNames: { [key: string]: string } = {
  Timestamp: "timestamp",
  "Which boy? ": "boy",
  "Pleasure type": "type",
  "Mitigating factors": "mitigatingFactors",
  "Hey there, who's the edger? ": "edger",
  "How was the session supervised? ": "method",
  "How long was the supervised edging, in minutes? ": "sessionLength",
  "How many ruined orgasms did the boy experience? ": "nRuined",
  "How many full orgasms did the boy experience? ": "nFull",
  "Anything else important to note about the session? ": "note",
  "Types of release [Hands free]": "releaseHandsfree",
  "Types of release [Ruined]": "releaseRuined",
  "Types of release [Full]": "releaseFull",
  "Types of release [Ball busting]": "releaseBallBusting",
  "Types of release [Anal]": "releaseAnal",
  "Types of release [Nipple]": "releaseNipple",
  "Types of release [Tapping]": "releaseTapping",
  "Did everything that came out of the boy go back in to the boy? ": "eatCum",
  "Did everything that came out of the boy go back in to the boy? _1":
    "eatCum2",
};

const Result = z.object({
  timestamp: z.string(),
  boy: z.string(),
  type: z.string(),
  mitigatingFactors: z.string(),
  edger: z.string(),
  method: z.string(),
  sessionLength: z.string(),
  nRuined: z.string(),
  nFull: z.string(),
  note: z.string(),
  releaseHandsfree: z.string(),
  releaseRuined: z.string(),
  releaseFull: z.string(),
  releaseBallBusting: z.string(),
  releaseAnal: z.string(),
  releaseNipple: z.string(),
  releaseTapping: z.string(),
  eatCum: z.string(),
  eatCum2: z.string(),
});

type ResponseType = {
  eatCum: boolean;
  releases: string[];
  boy: string;
  type: string;
  mitigatingFactors: string;
  edger: string;
  method: string;
  sessionLength: number;
  note: string;
  timestamp: Date;
}[];

function groupBy<K, V>(array: V[], grouper: (item: V) => K) {
  return array.reduce((store, item) => {
    var key = grouper(item);
    if (!store.has(key)) {
      store.set(key, [item]);
    } else {
      store.get(key)!.push(item);
    }
    return store;
  }, new Map<K, V[]>());
}

export const getData = cache(async () => {
  const url = process.env.DATA_URL;
  if (!url) {
    return;
    // return NextResponse.json(
    //   { error: "Internal server error" },
    //   { status: 500 }
    // );
  }

  await new Promise<void>((resolve) => {
    https.get(url, (res) => {
      const fileStream = createWriteStream("data.csv");
      res.pipe(fileStream);

      fileStream.on("finish", () => {
        fileStream.close();
        console.log("Download finished");
        resolve();
      });
    });
  });

  const file = createReadStream("data.csv");

  //   parse with papaparse
  const res = await new Promise<ResponseType>((resolve) =>
    Papa.parse(file, {
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
            eatCum: eatCum === "Yes",
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
});

export const penaltyMap = new Map<string, number>([
  ["Full", 10],
  ["Ruined", 5],
  ["Handsfree", 0],
  ["BallBusting", 4],
  ["Nipple", 2],
  ["Anal", -20],
  ["Tapping", -1],
]);

const noCumScore = (penalty: string) => {
  if (penalty === "Anal" || penalty === "Tapping") return 0.5;
  return 2;
};

export const revalidate = 3600; // revalidate the data at most every hour
