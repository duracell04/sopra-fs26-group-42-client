import { MathBlock, MathPair, MathProblem } from "@/types/problem";

export const PROBLEM_PAIR_COUNT = 5;
export const BLOCK_COUNT_PER_LEVEL = PROBLEM_PAIR_COUNT * 2;
export const DEFAULT_LEVEL_COUNT = 25;

const MIN_FACTOR = 1;
const MAX_FACTOR = 12;

type LevelTemplate = ReadonlyArray<readonly [number, number]>;

function clampFactor(value: unknown): number | null {
  const numericValue = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(numericValue)) {
    return null;
  }

  return Math.max(MIN_FACTOR, Math.min(MAX_FACTOR, Math.round(numericValue)));
}

function createPair(a: number, b: number): MathPair {
  return { a, b, product: a * b };
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray<T>(items: readonly T[]): T[] {
  const shuffled = [...items];

  for (let idx = shuffled.length - 1; idx > 0; idx -= 1) {
    const randomIdx = getRandomInt(0, idx);
    const current = shuffled[idx];
    shuffled[idx] = shuffled[randomIdx];
    shuffled[randomIdx] = current;
  }

  return shuffled;
}

function readPair(candidate: unknown): MathPair | null {
  if (Array.isArray(candidate)) {
    const a = clampFactor(candidate[0]);
    const b = clampFactor(candidate[1]);

    if (a === null || b === null) {
      return null;
    }

    return createPair(a, b);
  }

  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const maybePair = candidate as { a?: unknown; b?: unknown };
  const a = clampFactor(maybePair.a);
  const b = clampFactor(maybePair.b);

  if (a === null || b === null) {
    return null;
  }

  return createPair(a, b);
}

function finalizePairs(candidates: unknown): MathPair[] {
  const pairs: MathPair[] = [];
  const usedProducts = new Set<number>();

  if (Array.isArray(candidates)) {
    for (const candidate of candidates) {
      const pair = readPair(candidate);

      if (!pair || usedProducts.has(pair.product)) {
        continue;
      }

      pairs.push(pair);
      usedProducts.add(pair.product);

      if (pairs.length === PROBLEM_PAIR_COUNT) {
        break;
      }
    }
  }

  return pairs;
}

function buildBlocksFromPairs(pairs: MathPair[]): MathBlock[] {
  return pairs.flatMap((pair, pairIndex) => [
    { value: pair.a, pairIndex },
    { value: pair.b, pairIndex },
  ]);
}

function countMatchingProducts(
  blocks: Pick<MathBlock, "value">[],
  targetProduct: number,
): number {
  let matchCount = 0;

  for (let leftIndex = 0; leftIndex < blocks.length; leftIndex += 1) {
    for (
      let rightIndex = leftIndex + 1;
      rightIndex < blocks.length;
      rightIndex += 1
    ) {
      if (
        blocks[leftIndex].value * blocks[rightIndex].value === targetProduct
      ) {
        matchCount += 1;
      }
    }
  }

  return matchCount;
}

function hasUniqueSolutionForCurrentTarget(
  candidatePair: MathPair,
  futurePairs: MathPair[],
): boolean {
  const remainingBlocks = [
    ...buildBlocksFromPairs([candidatePair]),
    ...buildBlocksFromPairs(futurePairs),
  ];

  return countMatchingProducts(remainingBlocks, candidatePair.product) === 1;
}

function isUniquelySolvableLevel(pairs: MathPair[]): boolean {
  return pairs.every((pair, pairIndex) =>
    hasUniqueSolutionForCurrentTarget(pair, pairs.slice(pairIndex + 1))
  );
}

function randomizePairOrientation([a, b]: readonly [number, number]): MathPair {
  return Math.random() < 0.5 ? createPair(a, b) : createPair(b, a);
}

function buildProblemFromPairs(pairs: MathPair[]): MathProblem {
  const orderedBlocks = buildBlocksFromPairs(pairs);

  return {
    pairs,
    blocks: shuffleArray(orderedBlocks),
  };
}

// Pre-validated level templates. Every template has:
// - exactly 5 pair targets
// - no same-number factors
// - a single valid answer for each target while it is active
const LEVEL_TEMPLATE_CATALOG: ReadonlyArray<LevelTemplate> = [
  [[2, 3], [5, 6], [4, 9], [7, 11], [8, 12]],
  [[2, 3], [4, 6], [5, 9], [7, 12], [8, 11]],
  [[2, 3], [4, 6], [7, 11], [5, 8], [9, 12]],
  [[2, 8], [3, 11], [4, 9], [6, 10], [7, 12]],
  [[2, 3], [4, 5], [7, 10], [6, 8], [11, 12]],
  [[2, 3], [4, 8], [5, 10], [6, 11], [9, 12]],
  [[3, 5], [2, 6], [4, 7], [9, 11], [10, 12]],
  [[2, 4], [3, 12], [5, 7], [8, 10], [9, 11]],
  [[2, 5], [3, 9], [7, 8], [4, 10], [11, 12]],
  [[2, 5], [3, 7], [8, 12], [4, 10], [9, 11]],
  [[2, 4], [3, 7], [5, 12], [8, 10], [9, 11]],
  [[3, 4], [5, 7], [2, 9], [10, 11], [8, 12]],
  [[3, 4], [2, 7], [5, 10], [9, 12], [8, 11]],
  [[3, 5], [2, 8], [4, 7], [10, 11], [9, 12]],
  [[2, 8], [3, 6], [4, 9], [7, 10], [11, 12]],
  [[5, 7], [2, 3], [4, 9], [10, 11], [8, 12]],
  [[3, 5], [6, 7], [8, 12], [2, 11], [9, 10]],
  [[2, 5], [3, 7], [4, 8], [9, 10], [11, 12]],
  [[2, 6], [3, 10], [5, 8], [7, 12], [9, 11]],
  [[2, 8], [3, 4], [6, 9], [7, 12], [10, 11]],
  [[3, 7], [2, 4], [8, 11], [6, 12], [9, 10]],
  [[5, 6], [4, 8], [2, 12], [7, 9], [10, 11]],
  [[2, 3], [4, 7], [5, 9], [8, 10], [11, 12]],
  [[2, 3], [4, 7], [5, 8], [9, 12], [10, 11]],
  [[3, 9], [2, 7], [5, 8], [6, 10], [11, 12]],
  [[2, 4], [3, 5], [7, 9], [10, 12], [8, 11]],
  [[3, 4], [2, 5], [7, 8], [10, 11], [9, 12]],
  [[2, 5], [3, 4], [8, 9], [7, 10], [11, 12]],
  [[3, 4], [2, 5], [7, 8], [9, 12], [10, 11]],
  [[2, 4], [3, 5], [8, 9], [7, 10], [11, 12]],
  [[2, 3], [5, 11], [7, 8], [9, 10], [6, 12]],
  [[2, 7], [3, 5], [9, 10], [8, 11], [6, 12]],
  [[2, 6], [3, 9], [5, 7], [8, 12], [10, 11]],
  [[2, 7], [5, 6], [4, 12], [9, 10], [8, 11]],
  [[2, 6], [3, 8], [7, 9], [5, 10], [11, 12]],
  [[4, 7], [3, 9], [5, 11], [6, 12], [8, 10]],
  [[2, 4], [6, 7], [3, 8], [10, 11], [9, 12]],
  [[5, 6], [2, 8], [7, 9], [4, 11], [10, 12]],
  [[3, 7], [2, 5], [6, 11], [8, 12], [9, 10]],
  [[5, 7], [2, 8], [4, 9], [6, 11], [10, 12]],
  [[2, 6], [4, 8], [5, 10], [7, 12], [9, 11]],
  [[2, 5], [6, 9], [4, 10], [7, 11], [8, 12]],
  [[2, 3], [5, 8], [6, 10], [7, 12], [9, 11]],
  [[2, 5], [4, 10], [7, 8], [6, 11], [9, 12]],
  [[2, 3], [4, 7], [6, 9], [8, 10], [11, 12]],
  [[4, 8], [3, 9], [6, 7], [5, 12], [10, 11]],
  [[2, 4], [3, 6], [7, 8], [9, 11], [10, 12]],
  [[2, 4], [7, 8], [3, 6], [10, 12], [9, 11]],
  [[4, 5], [3, 11], [7, 9], [6, 10], [8, 12]],
  [[3, 5], [2, 6], [9, 11], [7, 10], [8, 12]],
  [[2, 3], [7, 10], [4, 6], [8, 9], [11, 12]],
  [[3, 5], [2, 8], [6, 7], [9, 10], [11, 12]],
  [[3, 5], [2, 7], [6, 8], [9, 12], [10, 11]],
  [[2, 5], [6, 7], [4, 10], [9, 11], [8, 12]],
  [[3, 5], [2, 7], [6, 8], [9, 10], [11, 12]],
  [[2, 3], [5, 6], [9, 11], [7, 10], [8, 12]],
  [[2, 5], [7, 8], [6, 9], [4, 10], [11, 12]],
  [[4, 7], [2, 5], [8, 10], [6, 11], [9, 12]],
  [[2, 4], [5, 9], [7, 8], [6, 11], [10, 12]],
  [[2, 7], [4, 6], [5, 9], [8, 10], [11, 12]],
  [[3, 6], [4, 9], [5, 8], [10, 11], [7, 12]],
  [[2, 4], [5, 6], [7, 12], [8, 10], [9, 11]],
  [[2, 4], [7, 8], [5, 9], [6, 10], [11, 12]],
  [[3, 5], [4, 8], [7, 9], [6, 12], [10, 11]],
  [[4, 7], [2, 5], [6, 10], [11, 12], [8, 9]],
  [[2, 6], [4, 7], [5, 8], [9, 10], [11, 12]],
  [[2, 4], [5, 8], [7, 9], [6, 10], [11, 12]],
  [[2, 5], [4, 8], [6, 7], [9, 11], [10, 12]],
  [[2, 4], [5, 6], [8, 10], [7, 11], [9, 12]],
  [[2, 4], [7, 10], [5, 9], [6, 8], [11, 12]],
  [[3, 4], [6, 8], [7, 12], [5, 10], [9, 11]],
  [[2, 5], [4, 7], [6, 8], [10, 11], [9, 12]],
  [[3, 5], [4, 7], [6, 11], [8, 12], [9, 10]],
  [[4, 5], [3, 7], [8, 10], [6, 11], [9, 12]],
  [[4, 5], [6, 7], [3, 9], [10, 11], [8, 12]],
  [[3, 4], [5, 8], [6, 11], [7, 10], [9, 12]],
  [[2, 5], [4, 6], [7, 10], [8, 9], [11, 12]],
  [[5, 7], [2, 4], [8, 10], [6, 9], [11, 12]],
  [[2, 4], [5, 7], [6, 8], [10, 11], [9, 12]],
  [[3, 4], [7, 8], [5, 9], [6, 11], [10, 12]],
  [[3, 5], [4, 7], [6, 10], [8, 11], [9, 12]],
  [[3, 6], [4, 5], [9, 10], [7, 12], [8, 11]],
  [[3, 6], [4, 7], [5, 10], [8, 9], [11, 12]],
  [[3, 7], [4, 5], [6, 9], [8, 12], [10, 11]],
  [[4, 5], [3, 6], [8, 11], [9, 12], [7, 10]],
  [[3, 5], [4, 9], [6, 7], [8, 10], [11, 12]],
  [[3, 4], [6, 7], [5, 9], [8, 11], [10, 12]],
  [[3, 4], [5, 8], [7, 9], [6, 10], [11, 12]],
  [[3, 4], [6, 7], [5, 9], [10, 12], [8, 11]],
  [[3, 4], [5, 7], [6, 9], [8, 12], [10, 11]],
  [[3, 4], [5, 6], [7, 10], [8, 11], [9, 12]],
  [[3, 5], [4, 6], [7, 11], [8, 9], [10, 12]],
  [[3, 5], [4, 7], [6, 8], [9, 11], [10, 12]],
  [[3, 5], [4, 6], [8, 11], [7, 9], [10, 12]],
  [[3, 5], [4, 7], [6, 8], [10, 12], [9, 11]],
  [[3, 4], [5, 7], [6, 10], [8, 9], [11, 12]],
  [[3, 5], [9, 11], [4, 6], [7, 8], [10, 12]],
  [[3, 4], [6, 8], [5, 7], [9, 11], [10, 12]],
  [[3, 4], [5, 6], [8, 10], [7, 9], [11, 12]],
  [[3, 4], [5, 6], [7, 8], [9, 10], [11, 12]],
];

function selectLevelTemplates(levelCount: number): LevelTemplate[] {
  if (levelCount <= 0) {
    return [];
  }

  if (levelCount >= LEVEL_TEMPLATE_CATALOG.length) {
    const selected: LevelTemplate[] = [];

    while (selected.length < levelCount) {
      selected.push(...shuffleArray(LEVEL_TEMPLATE_CATALOG));
    }

    return selected.slice(0, levelCount);
  }

  const bucketSize = LEVEL_TEMPLATE_CATALOG.length / levelCount;

  return Array.from({ length: levelCount }, (_, levelIndex) => {
    const startIndex = Math.floor(levelIndex * bucketSize);
    const endIndex = Math.max(
      startIndex + 1,
      Math.floor((levelIndex + 1) * bucketSize),
    );
    const bucket = LEVEL_TEMPLATE_CATALOG.slice(startIndex, endIndex);

    return bucket[getRandomInt(0, bucket.length - 1)];
  });
}

function buildPairsFromTemplate(template: LevelTemplate): MathPair[] {
  const pairs = template.map((pair) => randomizePairOrientation(pair));

  if (!isUniquelySolvableLevel(pairs)) {
    throw new Error("Encountered an ambiguous level template.");
  }

  return pairs;
}

function readBlock(candidate: unknown): MathBlock | null {
  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const maybeBlock = candidate as { value?: unknown; pairIndex?: unknown };
  const value = clampFactor(maybeBlock.value);
  const pairIndex = Number(maybeBlock.pairIndex);

  if (
    value === null ||
    !Number.isInteger(pairIndex) ||
    pairIndex < 0 ||
    pairIndex >= PROBLEM_PAIR_COUNT
  ) {
    return null;
  }

  return { value, pairIndex };
}

function finalizeBlocks(candidates: unknown): MathBlock[] {
  if (
    !Array.isArray(candidates) || candidates.length !== BLOCK_COUNT_PER_LEVEL
  ) {
    return [];
  }

  const blocks = candidates
    .map((candidate) => readBlock(candidate))
    .filter((block): block is MathBlock => block !== null);

  if (blocks.length !== BLOCK_COUNT_PER_LEVEL) {
    return [];
  }

  const pairCounts = new Array(PROBLEM_PAIR_COUNT).fill(0);

  for (const block of blocks) {
    pairCounts[block.pairIndex] += 1;
  }

  return pairCounts.every((count) => count === 2) ? blocks : [];
}

function doBlocksMatchPairs(blocks: MathBlock[], pairs: MathPair[]): boolean {
  return pairs.every((pair, pairIndex) => {
    const pairBlocks = blocks
      .filter((block) => block.pairIndex === pairIndex)
      .map((block) => block.value)
      .sort((left, right) => left - right);
    const pairValues = [pair.a, pair.b].sort((left, right) => left - right);

    return pairBlocks.length === 2 &&
      pairBlocks[0] === pairValues[0] &&
      pairBlocks[1] === pairValues[1];
  });
}

export function generateMathProblems(
  levelCount = DEFAULT_LEVEL_COUNT,
): MathProblem[] {
  return selectLevelTemplates(levelCount)
    .map((template) => buildProblemFromPairs(buildPairsFromTemplate(template)));
}

export function normalizeMathProblem(
  candidate: unknown,
): MathProblem | null {
  if (Array.isArray(candidate)) {
    const pairs = finalizePairs(candidate);
    return pairs.length === PROBLEM_PAIR_COUNT && isUniquelySolvableLevel(pairs)
      ? buildProblemFromPairs(pairs)
      : null;
  }

  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const maybeProblem = candidate as { pairs?: unknown; blocks?: unknown };
  const pairs = finalizePairs(maybeProblem.pairs);

  if (pairs.length !== PROBLEM_PAIR_COUNT || !isUniquelySolvableLevel(pairs)) {
    return null;
  }

  const blocks = finalizeBlocks(maybeProblem.blocks);
  const normalizedBlocks =
    blocks.length === BLOCK_COUNT_PER_LEVEL && doBlocksMatchPairs(blocks, pairs)
      ? blocks
      : buildProblemFromPairs(pairs).blocks;

  return {
    pairs,
    blocks: normalizedBlocks,
  };
}

export function normalizeMathProblems(
  candidates: unknown,
): MathProblem[] {
  if (!Array.isArray(candidates)) {
    return [];
  }

  const normalized = candidates
    .map((candidate) => normalizeMathProblem(candidate))
    .filter((problem): problem is MathProblem => problem !== null);

  return normalized;
}
