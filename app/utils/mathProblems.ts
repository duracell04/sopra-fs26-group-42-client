import { MathBlock, MathPair, MathProblem } from "@/types/problem";

export const PROBLEM_PAIR_COUNT = 5;
export const BLOCK_COUNT_PER_LEVEL = PROBLEM_PAIR_COUNT * 2;
export const DEFAULT_LEVEL_COUNT = 100;

const MIN_FACTOR = 1;
const MAX_FACTOR = 12;
const EARLY_LEVEL_MAX_FACTOR = 5;

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

function shuffleArray<T>(items: T[]): T[] {
  const shuffled = [...items];

  for (let idx = shuffled.length - 1; idx > 0; idx -= 1) {
    const randomIdx = getRandomInt(0, idx);
    const current = shuffled[idx];
    shuffled[idx] = shuffled[randomIdx];
    shuffled[randomIdx] = current;
  }

  return shuffled;
}

function createCandidatePairs(maxFactor: number, minimumHardFactor: number): MathPair[] {
  const candidates: MathPair[] = [];

  for (let a = MIN_FACTOR; a <= maxFactor; a += 1) {
    for (let b = a; b <= maxFactor; b += 1) {
      if (Math.max(a, b) < minimumHardFactor) {
        continue;
      }

      const basePair = createPair(a, b);
      const shouldSwap = Math.random() < 0.5;
      candidates.push(shouldSwap ? basePair : createPair(b, a));
    }
  }

  return shuffleArray(candidates);
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

function buildProblemFromPairs(pairs: MathPair[]): MathProblem {
  const orderedBlocks: MathBlock[] = pairs.flatMap((pair, pairIndex) => [
    { value: pair.a, pairIndex },
    { value: pair.b, pairIndex },
  ]);

  return {
    pairs,
    blocks: shuffleArray(orderedBlocks),
  };
}

function buildBlocksFromPairs(pairs: MathPair[]): MathBlock[] {
  return pairs.flatMap((pair, pairIndex) => [
    { value: pair.a, pairIndex },
    { value: pair.b, pairIndex },
  ]);
}

function countMatchingProducts(blocks: Pick<MathBlock, "value">[], targetProduct: number): number {
  let matchCount = 0;

  for (let leftIndex = 0; leftIndex < blocks.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < blocks.length; rightIndex += 1) {
      if (blocks[leftIndex].value * blocks[rightIndex].value === targetProduct) {
        matchCount += 1;
      }
    }
  }

  return matchCount;
}

function hasUniqueSolutionForCurrentTarget(candidatePair: MathPair, futurePairs: MathPair[]): boolean {
  const remainingBlocks = [
    ...buildBlocksFromPairs([candidatePair]),
    ...buildBlocksFromPairs(futurePairs),
  ];

  return countMatchingProducts(remainingBlocks, candidatePair.product) === 1;
}

function buildLevelPairsRecursively(
  stepIndex: number,
  futurePairs: MathPair[],
  usedProducts: Set<number>,
  maxFactor: number,
  minimumHardFactor: number,
): MathPair[] | null {
  if (stepIndex < 0) {
    return futurePairs;
  }

  const candidates = createCandidatePairs(maxFactor, minimumHardFactor);

  for (const candidate of candidates) {
    if (usedProducts.has(candidate.product)) {
      continue;
    }

    if (!hasUniqueSolutionForCurrentTarget(candidate, futurePairs)) {
      continue;
    }

    const nextUsedProducts = new Set(usedProducts);
    nextUsedProducts.add(candidate.product);

    const solvedPairs = buildLevelPairsRecursively(
      stepIndex - 1,
      [candidate, ...futurePairs],
      nextUsedProducts,
      maxFactor,
      minimumHardFactor,
    );

    if (solvedPairs) {
      return solvedPairs;
    }
  }

  return null;
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
  if (!Array.isArray(candidates) || candidates.length !== BLOCK_COUNT_PER_LEVEL) {
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

function generateLevelPairs(levelIndex: number, levelCount: number): MathPair[] {
  const progress = levelCount <= 1 ? 1 : levelIndex / (levelCount - 1);
  const maxFactor =
    EARLY_LEVEL_MAX_FACTOR +
    Math.round(progress * (MAX_FACTOR - EARLY_LEVEL_MAX_FACTOR));
  const preferredMinimumHardFactor = progress < 0.3
    ? MIN_FACTOR
    : Math.max(MIN_FACTOR, maxFactor - 3);

  for (
    let minimumHardFactor = preferredMinimumHardFactor;
    minimumHardFactor >= MIN_FACTOR;
    minimumHardFactor -= 1
  ) {
    const generatedPairs = buildLevelPairsRecursively(
      PROBLEM_PAIR_COUNT - 1,
      [],
      new Set<number>(),
      maxFactor,
      minimumHardFactor,
    );

    if (generatedPairs) {
      return generatedPairs;
    }
  }

  throw new Error(`Could not generate a uniquely solvable level ${levelIndex + 1}.`);
}

export function generateMathProblems(levelCount = DEFAULT_LEVEL_COUNT): MathProblem[] {
  return Array.from({ length: levelCount }, (_, levelIndex) =>
    buildProblemFromPairs(generateLevelPairs(levelIndex, levelCount))
  );
}

export function normalizeMathProblem(
  candidate: unknown,
): MathProblem | null {
  if (Array.isArray(candidate)) {
    const pairs = finalizePairs(candidate);
    return pairs.length === PROBLEM_PAIR_COUNT ? buildProblemFromPairs(pairs) : null;
  }

  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const maybeProblem = candidate as { pairs?: unknown; blocks?: unknown };
  const pairs = finalizePairs(maybeProblem.pairs);

  if (pairs.length !== PROBLEM_PAIR_COUNT) {
    return null;
  }

  const blocks = finalizeBlocks(maybeProblem.blocks);

  return {
    pairs,
    blocks: blocks.length === BLOCK_COUNT_PER_LEVEL ? blocks : buildProblemFromPairs(pairs).blocks,
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
