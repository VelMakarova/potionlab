import { elements, type Ingredient } from "../types/ingredient";
import type { BrewResult } from "../types/brewing";
import { InvalidResponseError } from "./errors";

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isIngredient(value: unknown): value is Ingredient {
  if (!isRecord(value) || !isRecord(value.assets)) return false;

  const assets = value.assets;

  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.description === "string" &&
    elements.some((element) => element === value.element) &&
    Array.isArray(value.properties) &&
    value.properties.every((property) => typeof property === "string") &&
    ["full", "thumb64", "thumb128"].every(
      (key) => typeof assets[key] === "string",
    )
  );
}

export function parseIngredients(value: unknown): Ingredient[] {
  if (
    !Array.isArray(value) ||
    !value.length ||
    !value.every(isIngredient) ||
    new Set(value.map((item) => item.id)).size !== value.length
  )
    throw new InvalidResponseError();

  return value;
}

export function parseBrewResult(value: unknown): BrewResult {
  if (!isRecord(value)) throw new InvalidResponseError();

  const status = value.status;

  if (
    status === "no_magic" ||
    status === "explosion" ||
    status === "cracked" ||
    status === "runaway" ||
    status === "useless"
  )
    return { status };

  if (
    status === "brewed" &&
    typeof value.description === "string" &&
    value.description.trim() &&
    isRecord(value.properties) &&
    Object.keys(value.properties).length &&
    Object.values(value.properties).every(
      (strength) => Number.isInteger(strength) && Number(strength) > 0,
    )
  ) {
    return { status, description: value.description };
  }

  throw new InvalidResponseError();
}
