import shifters from "../data/shifters.json";
import rearDerailleurs from "../data/rear_derailleurs.json";
import cassettes from "../data/cassettes.json";
import chains from "../data/chains.json";
import type { Part, PartCategory } from "../types";

const partsByCategory: Record<PartCategory, Part[]> = {
  shifter: shifters.parts as Part[],
  rear_derailleur: rearDerailleurs.parts as Part[],
  cassette: cassettes.parts as Part[],
  chain: chains.parts as Part[],
};

const allParts: Part[] = Object.values(partsByCategory).flat();

export function getAllParts(): Part[] {
  return allParts;
}

export function getPartsByCategory(category: string): Part[] {
  return partsByCategory[category as PartCategory] ?? [];
}

export function getPartById(id: string): Part | undefined {
  return allParts.find((p) => p.id === id);
}
