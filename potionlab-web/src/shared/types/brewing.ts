export type Outcome =
  "no_magic" | "explosion" | "cracked" | "runaway" | "useless";
export type BrewResult =
  { status: Outcome } | { status: "brewed"; description: string };
