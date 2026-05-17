import {
  generateMathProblems,
  normalizeMathProblem,
  normalizeMathProblems,
  PROBLEM_PAIR_COUNT,
  BLOCK_COUNT_PER_LEVEL,
  DEFAULT_LEVEL_COUNT,
} from '@/utils/mathProblems';

// ---------------------------------------------------------------------------
// generateMathProblems
// ---------------------------------------------------------------------------

describe('generateMathProblems – output structure', () => {
  let problems: ReturnType<typeof generateMathProblems>;

  beforeAll(() => {
    problems = generateMathProblems();
  });

  it('generates DEFAULT_LEVEL_COUNT problems when called with no arguments', () => {
    expect(problems).toHaveLength(DEFAULT_LEVEL_COUNT);
  });

  it('generates the exact number of problems requested', () => {
    expect(generateMathProblems(1)).toHaveLength(1);
    expect(generateMathProblems(3)).toHaveLength(3);
  });

  it('each problem has exactly PROBLEM_PAIR_COUNT pairs', () => {
    problems.forEach((p) => expect(p.pairs).toHaveLength(PROBLEM_PAIR_COUNT));
  });

  it('each problem has exactly BLOCK_COUNT_PER_LEVEL blocks', () => {
    problems.forEach((p) => expect(p.blocks).toHaveLength(BLOCK_COUNT_PER_LEVEL));
  });
});

describe('generateMathProblems – pair correctness', () => {
  let problems: ReturnType<typeof generateMathProblems>;

  beforeAll(() => {
    problems = generateMathProblems();
  });

  it('every pair satisfies product === a * b', () => {
    problems.forEach((problem) => {
      problem.pairs.forEach((pair) => {
        expect(pair.product).toBe(pair.a * pair.b);
      });
    });
  });

  it('all pair products within a level are unique (no duplicate targets)', () => {
    problems.forEach((problem) => {
      const products = problem.pairs.map((p) => p.product);
      expect(new Set(products).size).toBe(PROBLEM_PAIR_COUNT);
    });
  });

  it('all factor values are within the valid range [1, 12]', () => {
    problems.forEach((problem) => {
      problem.pairs.forEach((pair) => {
        expect(pair.a).toBeGreaterThanOrEqual(1);
        expect(pair.a).toBeLessThanOrEqual(12);
        expect(pair.b).toBeGreaterThanOrEqual(1);
        expect(pair.b).toBeLessThanOrEqual(12);
      });
    });
  });
});

describe('generateMathProblems – block correctness', () => {
  let problems: ReturnType<typeof generateMathProblems>;

  beforeAll(() => {
    problems = generateMathProblems();
  });

  it('every block pairIndex is within [0, PROBLEM_PAIR_COUNT)', () => {
    problems.forEach((problem) => {
      problem.blocks.forEach((block) => {
        expect(block.pairIndex).toBeGreaterThanOrEqual(0);
        expect(block.pairIndex).toBeLessThan(PROBLEM_PAIR_COUNT);
      });
    });
  });

  it('each pairIndex appears exactly twice across all blocks', () => {
    problems.forEach((problem) => {
      const counts = new Array(PROBLEM_PAIR_COUNT).fill(0);
      problem.blocks.forEach((block) => { counts[block.pairIndex] += 1; });
      counts.forEach((count) => expect(count).toBe(2));
    });
  });

  it("each pair's two blocks multiply to that pair's target product", () => {
    problems.forEach((problem) => {
      problem.pairs.forEach((pair, pairIndex) => {
        const pairBlocks = problem.blocks.filter((b) => b.pairIndex === pairIndex);
        expect(pairBlocks).toHaveLength(2);
        expect(pairBlocks[0].value * pairBlocks[1].value).toBe(pair.product);
      });
    });
  });
});

describe('generateMathProblems – unique solution guarantee', () => {
  it("each pair's product can be formed in exactly one way from the blocks still on the board when that pair is active", () => {
    // Pairs are solved in order (pairs[0] first). When pairs[i] is the active
    // target, pairs[0..i-1] have already been cleared, so only blocks with
    // pairIndex >= i remain. Uniqueness is guaranteed within that subset.
    const problems = generateMathProblems();

    problems.forEach((problem) => {
      problem.pairs.forEach((pair, pairIndex) => {
        const remainingBlocks = problem.blocks.filter((b) => b.pairIndex >= pairIndex);
        let matchCount = 0;

        for (let i = 0; i < remainingBlocks.length; i += 1) {
          for (let j = i + 1; j < remainingBlocks.length; j += 1) {
            if (remainingBlocks[i].value * remainingBlocks[j].value === pair.product) {
              matchCount += 1;
            }
          }
        }

        expect(matchCount).toBe(1);
      });
    });
  });
});

// ---------------------------------------------------------------------------
// normalizeMathProblem
// ---------------------------------------------------------------------------

describe('normalizeMathProblem – rejects invalid input', () => {
  it.each([
    [null],
    [undefined],
    [42],
    ['string'],
    [{}],
    [{ pairs: [] }],
    [[]],
    [[[1, 2], [2, 3]]],
  ])('returns null for %p', (input) => {
    expect(normalizeMathProblem(input)).toBeNull();
  });
});

describe('normalizeMathProblem – array format (list of [a, b] pairs)', () => {
  it('parses five valid [a, b] pairs with unique products', () => {
    const input = [
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 7],
    ];
    const result = normalizeMathProblem(input);
    expect(result).not.toBeNull();
    expect(result?.pairs).toHaveLength(PROBLEM_PAIR_COUNT);
    expect(result?.blocks).toHaveLength(BLOCK_COUNT_PER_LEVEL);
  });

  it('returns null when pairs share a product after clamping (not enough unique targets)', () => {
    // all a values clamp to 12, b=2 → every product is 24 → only 1 unique pair
    const input = Array.from({ length: PROBLEM_PAIR_COUNT }, (_, i) => [100 + i, 2]);
    expect(normalizeMathProblem(input)).toBeNull();
  });
});

describe('normalizeMathProblem – object format {pairs, blocks}', () => {
  function makeValidInput() {
    const pairs = [
      { a: 2, b: 3, product: 6 },
      { a: 3, b: 4, product: 12 },
      { a: 4, b: 5, product: 20 },
      { a: 5, b: 6, product: 30 },
      { a: 6, b: 7, product: 42 },
    ];
    const blocks = pairs.flatMap((pair, i) => [
      { value: pair.a, pairIndex: i },
      { value: pair.b, pairIndex: i },
    ]);
    return { pairs, blocks };
  }

  it('parses a valid {pairs, blocks} object', () => {
    const result = normalizeMathProblem(makeValidInput());
    expect(result).not.toBeNull();
    expect(result?.pairs).toHaveLength(PROBLEM_PAIR_COUNT);
    expect(result?.blocks).toHaveLength(BLOCK_COUNT_PER_LEVEL);
  });

  it('falls back to re-generating blocks when the blocks array is malformed', () => {
    const { pairs } = makeValidInput();
    const result = normalizeMathProblem({ pairs, blocks: 'garbage' });
    expect(result).not.toBeNull();
    expect(result?.blocks).toHaveLength(BLOCK_COUNT_PER_LEVEL);
  });
});

// ---------------------------------------------------------------------------
// normalizeMathProblems
// ---------------------------------------------------------------------------

describe('normalizeMathProblems', () => {
  it('returns [] for non-array input', () => {
    expect(normalizeMathProblems(null)).toEqual([]);
    expect(normalizeMathProblems('string')).toEqual([]);
    expect(normalizeMathProblems(42)).toEqual([]);
  });

  it('returns [] for an empty array', () => {
    expect(normalizeMathProblems([])).toEqual([]);
  });

  it('silently filters out invalid problems from a mixed array', () => {
    const result = normalizeMathProblems([{ garbage: true }, null, 'bad']);
    expect(result).toEqual([]);
  });

  it('normalizes an array containing one valid problem in array format', () => {
    const validProblem = [[2, 3], [3, 4], [4, 5], [5, 6], [6, 7]];
    const result = normalizeMathProblems([validProblem]);
    expect(result).toHaveLength(1);
    expect(result[0].pairs).toHaveLength(PROBLEM_PAIR_COUNT);
    expect(result[0].blocks).toHaveLength(BLOCK_COUNT_PER_LEVEL);
  });
});
