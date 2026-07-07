import type { Category, Format } from "@/types/domain";

export const CATEGORIES: Category[] = [
  { id: "noodles", label: "Stir-fry Noodles", servingStyle: "stir-fry" },
  { id: "soup-noodles", label: "Soup Noodles", servingStyle: "soup" },
  { id: "protein-pasta", label: "Protein Pasta", servingStyle: "stir-fry" },
  { id: "hot-sauce", label: "Hot Sauce", servingStyle: "sauce" },
  { id: "potato-chips", label: "Potato Chips", servingStyle: "snack" },
  { id: "mac-and-cheese", label: "Mac & Cheese", servingStyle: "stir-fry" },
  { id: "glass-noodles", label: "Glass Noodles", servingStyle: "stir-fry" },
  { id: "dumplings", label: "Dumplings", servingStyle: "frozen-meal" },
  { id: "rice", label: "Fried Rice", servingStyle: "frozen-meal" },
  { id: "tteokbokki", label: "Tteokbokki", servingStyle: "stir-fry" },
  { id: "snack", label: "Snacks", servingStyle: "snack" },
];

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

export const FORMATS: Format[] = [
  { id: "multi", label: "Multi", archetype: "noodle-pack" },
  { id: "big-bowl", label: "Big Bowl", archetype: "bowl" },
  { id: "bowl", label: "Bowl", archetype: "bowl" },
  { id: "cup", label: "Cup", archetype: "cup" },
  { id: "bag", label: "Bag", archetype: "bag" },
  { id: "pack", label: "Pack", archetype: "pack" },
  { id: "box", label: "Box", archetype: "frozen-box" },
  { id: "four-cup", label: "4 Cup", archetype: "cup" },
  { id: "sauce-200g", label: "200g Bottle", archetype: "bottle" },
  { id: "sauce-350g", label: "350g Bottle", archetype: "bottle" },
  { id: "sauce-stick", label: "Stick", archetype: "stick" },
  { id: "frozen", label: "Frozen", archetype: "frozen-box" },
  { id: "shelf-stable", label: "Shelf Stable", archetype: "pack" },
];

export const FORMAT_BY_ID = Object.fromEntries(FORMATS.map((f) => [f.id, f]));
