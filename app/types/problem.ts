export interface MathPair {
  a: number;
  b: number;
  product: number;
}

export interface MathBlock {
  value: number;
  pairIndex: number;
}

export interface MathProblem {
  // 5 pairs per problem; pair at index i owns target product pairs[i].product
  pairs: MathPair[];
  // 10 shuffled block values; pairIndex links each block to its target pair
  blocks: MathBlock[];
}
