import { z } from "zod";

export const columnNames: { [key: string]: string } = {
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

export const Result = z.object({
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

export type ResponseType = {
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

export function groupBy<K, V>(array: V[], grouper: (item: V) => K) {
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

export const penaltyMap = new Map<string, number>([
  ["Full", 10],
  ["Ruined", 5],
  ["BallBusting", 4],
  ["Nipple", 2],
  ["Handsfree", 0],
  ["Tapping", -1],
  ["Anal", -20],
]);

export const noCumScore = (penalty: string) => {
  if (penalty === "Anal" || penalty === "Tapping") return 0.5;
  return 2;
};
