"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BulletObject } from "@/utils/gameObject/bullet";
import { NumberBlockObject, GameBlockState } from "@/utils/gameObject/gameBlockObject";
import { ShipObject } from "@/utils/gameObject/ship";
import { useApi } from "@/hooks/useApi";
import { useWebSocket } from "@/hooks/useWebSocket";
import { MathProblem } from "@/types/problem";
import { GameSession } from "@/types/session";
import { generateMathProblems, normalizeMathProblems } from "@/utils/mathProblems";

//-----------------------------------------------------------------------------
// -------------- Gameplay and session configuration constants ----------------
//-----------------------------------------------------------------------------
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const SHIP_HALF_WIDTH = 15;
const SHIP_MOVE_SPEED = 420;
const FALLING_BLOCK_SPEED = 21;
const SESSION_FETCH_RETRIES = 3;
const SESSION_PROBLEM_POLL_LIMIT = 45;
const SESSION_PROBLEM_POLL_INTERVAL_MS = 2000;
const INITIAL_LIFE = 3;
const INCORRECT_FLASH_MS = 1000;


// Section: Canvas rendering style configuration
const BLOCK_STYLE = {
  block: {
    size: 50,
    halfSize: 25,
    fillByState: {
      [GameBlockState.DEFAULT]: "#2980b9",
      [GameBlockState.SELECTED]: "#f39c12",
      [GameBlockState.INCORRECT]: "#e74c3c",
      [GameBlockState.ELIMINATED]: "transparent",
    } satisfies Record<GameBlockState, string>,
    text: {
      fillStyle: "white",
      font: "18px Arial",
      textAlign: "center" as const,
      textBaseline: "middle" as const,
    },
  },
  bullet: { fillStyle: "yellow", width: 4, height: 8 },
};

// Realtime and API payload types
type RealtimeMessage =
|{
  type: "move" | "shoot";
  playerId: number;
  x: number;
  y: number;
}
|{
  type: "game_state";
  sessionCode: string;
  score: number;
  life: number;
  gameOver?: boolean;
  errorTriggered?: boolean;
  pendingSelectionBlockId?: number | null;
  targetProduct?: number;
  blocks: {
    id: number;
    value: number;
    state: "DEFAULT" | "SELECTED" | "ELIMINATED" | "INCORRECT";
  }[];
};



type SessionProblemsResponse = {
  problemsJson?: unknown;
};

type SessionProblemErrorPayload = {
  error?: string;
};

// General utility helpers
function formatElapsedTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.max(0, totalSeconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
}

function parseTimestamp(value: string | null | undefined): number | null {
  if (!value) {
    return null;
  }

  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getStoredUserId(): number | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawId = localStorage.getItem("id");
  if (!rawId) {
    return null;
  }

  try {
    const parsedId = JSON.parse(rawId);
    const userId = Number(parsedId);
    return Number.isFinite(userId) ? userId : null;
  } catch {
    const userId = Number(rawId);
    return Number.isFinite(userId) ? userId : null;
  }
}

function formatErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
}

// Collision geometry helpers
function getBulletRect(bullet: BulletObject) {
  const halfWidth = BLOCK_STYLE.bullet.width / 2;
  return {
    left: bullet.x - halfWidth,
    right: bullet.x + halfWidth,
    top: bullet.y - BLOCK_STYLE.bullet.height,
    bottom: bullet.y,
  };
}

function getBlockRect(block: NumberBlockObject) {
  return {
    left: block.xPosition - BLOCK_STYLE.block.halfSize,
    right: block.xPosition + BLOCK_STYLE.block.halfSize,
    top: block.yPosition - BLOCK_STYLE.block.halfSize,
    bottom: block.yPosition + BLOCK_STYLE.block.halfSize,
  };
}

function isOverlapping(
  a: { left: number; right: number; top: number; bottom: number },
  b: { left: number; right: number; top: number; bottom: number },
) {
  return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}

// Problem data transformation helpers
function buildBlocks(problem: MathProblem, levelIndex: number): NumberBlockObject[] {
  const xPositions = [70, 150, 230, 310, 390, 470, 550, 630, 710, 760];
  const pairInstanceCounts = new Array(problem.pairs.length).fill(0);

  return problem.blocks.map((block, idx) => {
    const pairOffset = pairInstanceCounts[block.pairIndex];
    pairInstanceCounts[block.pairIndex] += 1;
    const stableBlockId = levelIndex * 1000 + block.pairIndex * 2 + pairOffset;

    return new NumberBlockObject({
      uuid: `level-${levelIndex}-block-${block.pairIndex}-${pairOffset}`,
      name: `Block ${idx}`,
      id: stableBlockId,
      value: block.value,
      xPosition: xPositions[idx],
      yPosition: -60,
      state: GameBlockState.DEFAULT,
    });
  });
}

function parseStoredProblems(problemsJson: unknown): MathProblem[] {
  if (typeof problemsJson === "string") {
    try {
      return normalizeMathProblems(JSON.parse(problemsJson));
    } catch {
      return [];
    }
  }

  return normalizeMathProblems(problemsJson);
}

function parseStoredProblemError(problemsJson: unknown): string | null {
  if (typeof problemsJson !== "string") {
    return null;
  }

  try {
    const parsed = JSON.parse(problemsJson) as SessionProblemErrorPayload;
    return typeof parsed?.error === "string" ? parsed.error : null;
  } catch {
    return null;
  }
}

// Main game page content component
function PlayTestContent() {
  
  // Section: Router and service hooks
  const searchParams = useSearchParams();
  const code = searchParams.get("code") ?? "";
  const apiService = useApi();

  // Section: Refs for canvas, controls, and entities
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bulletsRef = useRef<BulletObject[]>([]);
  const pressedKeysRef = useRef({ left: false, right: false });

  const localShipRef = useRef(
    new ShipObject({
      uuid: "ship-local",
      name: "Player Ship",
      playerId: getStoredUserId() ?? 1,
      xPosition: 400,
      yPosition: 550,
    }),
  );
  const remoteShipRef = useRef(
    new ShipObject({
      uuid: "ship-remote",
      name: "Partner Ship",
      playerId: -1,
      xPosition: 250,
      yPosition: 550,
    }),
  );
  const remoteTargetRef = useRef({ x: 250, y: 550 });

  const scoreRef = useRef(0);

  const lifeRef = useRef(INITIAL_LIFE);
  const penaltyGameOverRef = useRef(false);


  // Loading and level progression state
  const [isLoadingProblems, setIsLoadingProblems] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState("Loading...");
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [scoreUi, setScoreUi] = useState(0);
  const [lifeUi, setLifeUi] = useState(INITIAL_LIFE);
  const [isPenaltyGameOver, setIsPenaltyGameOver] = useState(false);
  const [isErrorFlash, setIsErrorFlash] = useState(false);
  const [timerSourceMs, setTimerSourceMs] = useState<number | null>(null);
  const [displayedElapsedSeconds, setDisplayedElapsedSeconds] = useState(0);
  const [finalElapsedSeconds, setFinalElapsedSeconds] = useState<number | null>(null);
  const [isGameFinished, setIsGameFinished] = useState(false);
  const gameOverRef = useRef(false);

  const problemsRef = useRef<MathProblem[]>([]);
  const currentLevelRef = useRef(0);
  const currentPairIndexRef = useRef(0);
  const selectedBlockIdsRef = useRef<Set<number>>(new Set());
  const blocksRef = useRef<NumberBlockObject[]>([]);
  const incorrectResetTimeoutsRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const errorFlashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerSourceMsRef = useRef<number | null>(null);
  const displayedElapsedSecondsRef = useRef(0);
  const finalElapsedSecondsRef = useRef<number | null>(null);
  const isGameFinishedRef = useRef(false);
  const finishRequestStartedRef = useRef(false);

  const triggerIncorrectFlash = useCallback(() => {
    setIsErrorFlash(true);

    if (errorFlashTimeoutRef.current) {
      clearTimeout(errorFlashTimeoutRef.current);
    }

    errorFlashTimeoutRef.current = setTimeout(() => {
      setIsErrorFlash(false);
      errorFlashTimeoutRef.current = null;
    }, INCORRECT_FLASH_MS);
  }, []);

  const scheduleIncorrectReset = useCallback((blockId: number) => {
    const existingTimeout = incorrectResetTimeoutsRef.current.get(blockId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    const timeoutId = setTimeout(() => {
      const block = blocksRef.current.find((candidate) => candidate.id === blockId);
      if (block?.state === GameBlockState.INCORRECT) {
        block.state = GameBlockState.DEFAULT;
      }
      incorrectResetTimeoutsRef.current.delete(blockId);
    }, INCORRECT_FLASH_MS);

    incorrectResetTimeoutsRef.current.set(blockId, timeoutId);
  }, []);

  const syncPairProgressFromBlocks = useCallback(() => {
    const currentProblem = problemsRef.current[currentLevelRef.current];
    if (!currentProblem) {
      return;
    }

    const completedPairs = Math.floor(
      blocksRef.current.filter((block) => block.state === GameBlockState.ELIMINATED).length / 2,
    );

    if (completedPairs >= currentProblem.pairs.length) {
      const nextLevel = currentLevelRef.current + 1;
      if (nextLevel < problemsRef.current.length) {
        currentLevelRef.current = nextLevel;
        currentPairIndexRef.current = 0;
        selectedBlockIdsRef.current.clear();
        blocksRef.current = buildBlocks(problemsRef.current[nextLevel], nextLevel);
      }
      return;
    }

    currentPairIndexRef.current = Math.max(currentPairIndexRef.current, completedPairs);
  }, []);

  // Realtime message handler
  const handleMessage = useCallback((message: unknown) => {
    const data = message as Partial<RealtimeMessage>;

    if (data.type === "game_state") {
      if (code && data.sessionCode !== code) {
        return;
      }

      if (
        typeof data.score !== "number" ||
        typeof data.life !== "number" ||
        !Array.isArray(data.blocks)
      ) {
        return;
      }

      const previousLife = lifeRef.current;
      scoreRef.current = data.score;
      lifeRef.current = data.life;
      setScoreUi(data.score);
      setLifeUi(data.life);

      if (data.errorTriggered || data.life < previousLife) {
        triggerIncorrectFlash();
      }

      if (data.gameOver || data.life <= 0) {
        penaltyGameOverRef.current = true;
        pressedKeysRef.current.left = false;
        pressedKeysRef.current.right = false;
        setIsPenaltyGameOver(true);
      }

      const incomingBlocks = data.blocks;
      const nextBlocks = blocksRef.current.map((existingBlock) => {
        const incoming = incomingBlocks.find((candidate) => candidate.id === existingBlock.id);
        if (!incoming) {
          return existingBlock;
        }

        if (
          existingBlock.state === GameBlockState.ELIMINATED &&
          incoming.state !== "ELIMINATED"
        ) {
          return existingBlock;
        }

        switch (incoming.state) {
          case "DEFAULT":
            existingBlock.state = GameBlockState.DEFAULT;
            break;
          case "SELECTED":
            existingBlock.state = GameBlockState.SELECTED;
            break;
          case "ELIMINATED":
            existingBlock.state = GameBlockState.ELIMINATED;
            break;
          case "INCORRECT":
            existingBlock.state = GameBlockState.INCORRECT;
            scheduleIncorrectReset(existingBlock.id);
            break;
        }

        return existingBlock;
      });

      blocksRef.current = nextBlocks;
      selectedBlockIdsRef.current = new Set(
        nextBlocks
          .filter((block) => block.state === GameBlockState.SELECTED)
          .map((block) => block.id),
      );
      syncPairProgressFromBlocks();
      return;
    }

    if (
      (data.type !== "move" && data.type !== "shoot") ||
      typeof data.playerId !== "number" ||
      typeof data.x !== "number" ||
      typeof data.y !== "number"
    ) {
      return;
    }

    if (data.playerId === localShipRef.current.playerId) {
      return;
    }

    if (data.type === "move") {
      remoteTargetRef.current.x = data.x;
      remoteTargetRef.current.y = data.y;
      return;
    }

    bulletsRef.current.push(
      new BulletObject({ x: data.x, y: data.y, playerId: data.playerId }),
    );
  }, [code, scheduleIncorrectReset, syncPairProgressFromBlocks, triggerIncorrectFlash]);

  // functions for live scores
  const increaseScore = useCallback(() => {
    scoreRef.current += 1;
    setScoreUi(scoreRef.current);
  }, []);

  const decreaseLife = useCallback(() => {
    const nextLife = Math.max(0, lifeRef.current - 1);
    lifeRef.current = nextLife;
    setLifeUi(nextLife);
    setIsErrorFlash(true);
    setTimeout(() => {
      setIsErrorFlash(false);
    }, INCORRECT_FLASH_MS);

    if (nextLife === 0) {
      penaltyGameOverRef.current = true;
      pressedKeysRef.current.left = false;
      pressedKeysRef.current.right = false;
      setIsPenaltyGameOver(true);
    }
  }, []);

  const resetRoundStats = useCallback(() => {
    scoreRef.current = 0;
    lifeRef.current = INITIAL_LIFE;
    penaltyGameOverRef.current = false;
    gameOverRef.current = false;
    isGameFinishedRef.current = false;
    finishRequestStartedRef.current = false;
    setScoreUi(0);
    setLifeUi(INITIAL_LIFE);
    setIsPenaltyGameOver(false);
    setIsErrorFlash(false);
    setDisplayedElapsedSeconds(0);
    setFinalElapsedSeconds(null);
    setIsGameFinished(false);
  }, []);

  const triggerGameOver = useCallback((message: string) => {
    if (gameOverRef.current) {
      return;
    }

    gameOverRef.current = true;
    setLoadingStatus("Game Over");
    setLoadingError(message);
    setIsLoadingProblems(true);
  }, []);

 // Session problem initialization helpers
  const applyProblems = useCallback((candidate: unknown) => {
    const problems = normalizeMathProblems(candidate);

    if (!problems.length) {
      throw new Error("No valid level data was available.");
    }

    problemsRef.current = problems;
    currentLevelRef.current = 0;
    currentPairIndexRef.current = 0;
    selectedBlockIdsRef.current.clear();
    blocksRef.current = buildBlocks(problems[0], 0);

    resetRoundStats();
    incorrectResetTimeoutsRef.current.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    incorrectResetTimeoutsRef.current.clear();
    if (errorFlashTimeoutRef.current) {
      clearTimeout(errorFlashTimeoutRef.current);
      errorFlashTimeoutRef.current = null;
    }

    setLoadingError(null);
    setIsLoadingProblems(false);

    if (!code && timerSourceMsRef.current === null) {
      const startedAtMs = Date.now();
      timerSourceMsRef.current = startedAtMs;
      setTimerSourceMs(startedAtMs);
    }
  }, [code, resetRoundStats]);

  // WebSocket integration
  const { sendMessage } = useWebSocket(handleMessage);

  useEffect(() => {
    timerSourceMsRef.current = timerSourceMs;
  }, [timerSourceMs]);

  useEffect(() => {
    displayedElapsedSecondsRef.current = displayedElapsedSeconds;
  }, [displayedElapsedSeconds]);

  useEffect(() => {
    finalElapsedSecondsRef.current = finalElapsedSeconds;
  }, [finalElapsedSeconds]);

  useEffect(() => {
    isGameFinishedRef.current = isGameFinished;
  }, [isGameFinished]);

  const freezeTimer = useCallback((elapsedSeconds: number) => {
    const frozenSeconds = Math.max(0, elapsedSeconds);
    isGameFinishedRef.current = true;
    setDisplayedElapsedSeconds(frozenSeconds);
    setFinalElapsedSeconds(frozenSeconds);
    setIsGameFinished(true);
    pressedKeysRef.current.left = false;
    pressedKeysRef.current.right = false;
  }, []);

  const completeGame = useCallback(async () => {
    if (isGameFinishedRef.current) {
      return;
    }

    const startedAtMs = timerSourceMsRef.current;
    const fallbackElapsedSeconds = finalElapsedSecondsRef.current
      ?? (startedAtMs !== null
        ? Math.max(0, Math.floor((Date.now() - startedAtMs) / 1000))
        : displayedElapsedSecondsRef.current);

    freezeTimer(fallbackElapsedSeconds);

    if (!code || finishRequestStartedRef.current) {
      return;
    }

    const userId = getStoredUserId();
    if (!userId) {
      return;
    }

    finishRequestStartedRef.current = true;

    try {
      const finishedSession = await apiService.post<GameSession>(`/sessions/${code}/finish`, {
        userId,
      });

      const startedAtMsFromSession = parseTimestamp(finishedSession.startedAt);
      if (startedAtMsFromSession !== null) {
        timerSourceMsRef.current = startedAtMsFromSession;
        setTimerSourceMs(startedAtMsFromSession);
      }

      freezeTimer(finishedSession.elapsedSeconds ?? fallbackElapsedSeconds);
    } catch (error) {
      console.warn("Failed to synchronize finished session timer:", error);
    }
  }, [apiService, code, freezeTimer]);

  useEffect(() => {
    if (
      timerSourceMs === null ||
      isLoadingProblems ||
      isPenaltyGameOver ||
      isGameFinished
    ) {
      return;
    }

    const syncElapsedSeconds = () => {
      setDisplayedElapsedSeconds(
        Math.max(0, Math.floor((Date.now() - timerSourceMs) / 1000)),
      );
    };

    syncElapsedSeconds();

    const intervalId = setInterval(syncElapsedSeconds, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isGameFinished, isLoadingProblems, isPenaltyGameOver, timerSourceMs]);

  // Session persistence helper
  const persistSessionProblemState = useCallback(
    async (sessionCode: string, payload: unknown) => {
      let lastError: unknown = null;

      for (let attempt = 1; attempt <= 3; attempt += 1) {
        try {
          await apiService.post(`/sessions/${sessionCode}/problems`, {
            problemsJson: JSON.stringify(payload),
          });
          return;
        } catch (error) {
          lastError = error;

          if (attempt < 3) {
            await sleep(attempt * 1000);
          }
        }
      }

      throw lastError ?? new Error("Failed to store generated problems in the session.");
    },
    [apiService],
  );

  // Session bootstrap and problem loading flow
  useEffect(() => {
    let cancelled = false;
    let pollTimeout: ReturnType<typeof setTimeout> | null = null;

    const clearPollTimeout = () => {
      if (pollTimeout) {
        clearTimeout(pollTimeout);
        pollTimeout = null;
      }
    };

    const setFatalLoadingError = (message: string) => {
      if (cancelled) {
        return;
      }

      setLoadingError(message);
      setLoadingStatus(message);
      setIsLoadingProblems(true);
    };

    const configureAsCreator = (currentUserId: number) => {
      localShipRef.current.playerId = currentUserId;
      remoteShipRef.current.playerId = -1;
    };

    const configureAsJoiner = (currentUserId: number, creatorId: number) => {
      localShipRef.current.playerId = currentUserId;
      remoteShipRef.current.playerId = creatorId;
    };

    const fetchSessionWithRetry = async () => {
      let lastError: unknown = null;

      for (let attempt = 1; attempt <= SESSION_FETCH_RETRIES; attempt += 1) {
        if (cancelled) {
          throw new Error("Session loading cancelled.");
        }

        setLoadingStatus(
          attempt === 1
            ? "Loading session..."
            : `Loading session (retry ${attempt}/${SESSION_FETCH_RETRIES})...`,
        );

        try {
          return await apiService.get<GameSession>(`/sessions/${code}`);
        } catch (error) {
          lastError = error;

          if (attempt < SESSION_FETCH_RETRIES) {
            await sleep(attempt * 1000);
          }
        }
      }

      throw lastError ?? new Error(`Failed to load session ${code}.`);
    };

    const loadCreatorProblems = async (sessionCode?: string) => {
      configureAsCreator(getStoredUserId() ?? 1);
      setLoadingError(null);
      setLoadingStatus("Generating levels locally...");

      let problems: MathProblem[];

      try {
        problems = generateMathProblems();
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("Level generation failed:", error);

        if (sessionCode) {
          try {
            await persistSessionProblemState(sessionCode, { error: "Level generation failed" });
          } catch (persistError) {
            console.error("Failed to synchronize generation error to the session:", persistError);
          }
        }

        setFatalLoadingError("Level generation failed");
        return;
      }

      if (sessionCode) {
        setLoadingStatus("Sharing generated levels with the session...");

        try {
          await persistSessionProblemState(sessionCode, problems);
        } catch (error) {
          if (cancelled) {
            return;
          }

          setFatalLoadingError(
            `Failed to synchronize the generated level with session ${sessionCode}. ${formatErrorMessage(
              error,
              "Please restart the session and try again.",
            )}`,
          );
          return;
        }
      }

      if (!cancelled) {
        applyProblems(problems);
      }
    };

    const loadJoinerProblems = () => {
      setLoadingError(null);
      setLoadingStatus("Waiting for host to generate levels...");

      let attempts = 0;

      const poll = async () => {
        if (cancelled) {
          return;
        }

        attempts += 1;

        try {
          const data = await apiService.get<SessionProblemsResponse>(
            `/sessions/${code}/problems`,
          );
          const problemError = parseStoredProblemError(data?.problemsJson);

          if (problemError) {
            setFatalLoadingError(problemError);
            return;
          }

          const problems = parseStoredProblems(data?.problemsJson);

          if (problems.length) {
            applyProblems(problems);
            return;
          }
        } catch (error) {
          console.warn("Polling session problems failed, retrying:", error);
        }

        if (attempts >= SESSION_PROBLEM_POLL_LIMIT) {
          try {
            const session = await apiService.get<GameSession>(`/sessions/${code}`);

            if (session.status === "CANCELLED") {
              setFatalLoadingError("The session was cancelled before the level data was shared.");
              return;
            }
          } catch {
            // Ignore follow-up errors and surface the timeout message below.
          }

          setFatalLoadingError(
            "Timed out waiting for the host to share the level. Please restart the session and try again.",
          );
          return;
        }

        setLoadingStatus(
          `Waiting for host to generate levels${".".repeat(((attempts - 1) % 3) + 1)}`,
        );
        clearPollTimeout();
        pollTimeout = setTimeout(() => {
          void poll();
        }, SESSION_PROBLEM_POLL_INTERVAL_MS);
      };

      void poll();
    };

    setIsLoadingProblems(true);
    setLoadingError(null);

    const userId = getStoredUserId();

    if (!code) {
      void loadCreatorProblems();

      return () => {
        cancelled = true;
        clearPollTimeout();
      };
    }

    if (!userId) {
      setFatalLoadingError("Missing player session. Please sign in again before starting the game.");

      return () => {
        cancelled = true;
        clearPollTimeout();
      };
    }

    void (async () => {
      try {
        const session = await fetchSessionWithRetry();

        if (cancelled) {
          return;
        }

        const startedAtMs = parseTimestamp(session.startedAt);
        if (startedAtMs !== null) {
          timerSourceMsRef.current = startedAtMs;
          setTimerSourceMs(startedAtMs);
        }

        if (typeof session.elapsedSeconds === "number") {
          setDisplayedElapsedSeconds(Math.max(0, session.elapsedSeconds));
        }

        if (session.status === "CANCELLED") {
          setFatalLoadingError("This session is no longer available.");
          return;
        }

        if (session.creatorId === userId) {
          configureAsCreator(userId);
          await loadCreatorProblems(code);
        } else {
          configureAsJoiner(userId, session.creatorId);
          loadJoinerProblems();
        }
      } catch (error) {
        if (!cancelled) {
          setFatalLoadingError(
            `Failed to load session ${code}. ${formatErrorMessage(
              error,
              "Please return to the session lobby and try again.",
            )}`,
          );
        }
      }
    })();

    return () => {
      cancelled = true;
      clearPollTimeout();
    };
  }, [apiService, applyProblems, code, persistSessionProblemState]);

  // Canvas render loop, collisions, and player controls
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    let animationId = 0;
    let lastTimestamp: number | null = null;

    const drawBlock = (block: NumberBlockObject) => {
      if (block.state === GameBlockState.ELIMINATED) {
        return;
      }

      ctx.fillStyle = BLOCK_STYLE.block.fillByState[block.state];
      ctx.fillRect(
        block.xPosition - BLOCK_STYLE.block.halfSize,
        block.yPosition - BLOCK_STYLE.block.halfSize,
        BLOCK_STYLE.block.size,
        BLOCK_STYLE.block.size,
      );
      ctx.fillStyle = BLOCK_STYLE.block.text.fillStyle;
      ctx.font = BLOCK_STYLE.block.text.font;
      ctx.textAlign = BLOCK_STYLE.block.text.textAlign;
      ctx.textBaseline = BLOCK_STYLE.block.text.textBaseline;
      ctx.fillText(String(block.value), block.xPosition, block.yPosition);
    };

    const drawShip = (ship: ShipObject, color: string) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(ship.xPosition, ship.yPosition - 20);
      ctx.lineTo(ship.xPosition - SHIP_HALF_WIDTH, ship.yPosition + 10);
      ctx.lineTo(ship.xPosition + SHIP_HALF_WIDTH, ship.yPosition + 10);
      ctx.closePath();
      ctx.fill();
    };

    const drawHud = () => {
      const problem = problemsRef.current[currentLevelRef.current];
      const pair = problem?.pairs[currentPairIndexRef.current];
      const elapsedSeconds = finalElapsedSecondsRef.current ?? displayedElapsedSecondsRef.current;

      if (!pair) {
        return;
      }

      const clearedCount = currentPairIndexRef.current;

      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, 0, CANVAS_WIDTH, 64);

      ctx.fillStyle = "#00d4ff";
      ctx.font = "bold 22px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`TARGET: ${pair.product}`, CANVAS_WIDTH / 2, 25);

      ctx.fillStyle = "#aaa";
      ctx.font = "14px Arial";
      ctx.textAlign = "left";
      ctx.fillText(`Level ${currentLevelRef.current + 1}`, 12, 18);

      ctx.fillStyle = "#2ecc71";
      ctx.fillText(`Score: ${scoreRef.current}`, 12, 36);

      ctx.fillStyle = "#ff7675";
      ctx.fillText(`Life: ${lifeRef.current}`, 12, 54);
      ctx.fillStyle = "#aaa";
      ctx.fillText(`Time: ${formatElapsedTime(elapsedSeconds)}`, 160, 18);

      ctx.fillStyle = "#aaa";
      ctx.textAlign = "right";
      ctx.fillText(`Pairs: ${clearedCount}/5`, CANVAS_WIDTH - 12, 18);
      ctx.fillText(`Points: ${scoreRef.current}`, CANVAS_WIDTH - 12, 36);
    };

    const advancePair = () => {
      selectedBlockIdsRef.current.clear();
      const nextPair = currentPairIndexRef.current + 1;
      if (nextPair >= 5) {
        const nextLevel = currentLevelRef.current + 1;

        if (nextLevel >= problemsRef.current.length) {
          return true;
        }

        currentLevelRef.current = nextLevel;
        currentPairIndexRef.current = 0;
        blocksRef.current = buildBlocks(problemsRef.current[nextLevel], nextLevel);
        return false;
      }

      currentPairIndexRef.current = nextPair;

      for (const block of blocksRef.current) {
        if (block.state === GameBlockState.SELECTED) {
          block.state = GameBlockState.DEFAULT;
        }
      }

      return false;
    };

    const handleBlockHit = (_bullet: BulletObject, block: NumberBlockObject): boolean => {
      if (block.state === GameBlockState.ELIMINATED) {
        return false;
      }

      if (selectedBlockIdsRef.current.has(block.id)) {
        return true;
      }

      const selectedBlocks = blocksRef.current.filter((candidate) =>
        selectedBlockIdsRef.current.has(candidate.id) &&
        candidate.state !== GameBlockState.ELIMINATED
      );

      if (selectedBlocks.length >= 2) {
        return true;
      }

      const currentProblem = problemsRef.current[currentLevelRef.current];
      const targetPair = currentProblem?.pairs[currentPairIndexRef.current];

      if (!targetPair) {
        return true;
      }

      block.state = GameBlockState.SELECTED;
      selectedBlockIdsRef.current.add(block.id);

      if (code) {
        sendMessage("/app/block/select", {
          sessionCode: code,
          userId: getStoredUserId(),
          blockId: block.id,
          blockValue: block.value,
          targetProduct: targetPair.product,
          selectionWindowMs: INCORRECT_FLASH_MS,
        });
        return true;
      }

      const nextSelectedBlocks = blocksRef.current.filter((candidate) =>
        selectedBlockIdsRef.current.has(candidate.id) &&
        candidate.state !== GameBlockState.ELIMINATED
      );

      if (nextSelectedBlocks.length < 2) {
        return true;
      }

      const selectedProduct = nextSelectedBlocks[0].value * nextSelectedBlocks[1].value;

      // frontend to be authoritative
      if (selectedProduct === targetPair.product) {
        for (const selectedBlock of nextSelectedBlocks) {
          selectedBlock.eliminate();
        }

        increaseScore();
        selectedBlockIdsRef.current.clear();
        const didFinishGame = advancePair();
        if (didFinishGame) {
          void completeGame();
        }
        return true;
      }

      selectedBlockIdsRef.current.clear();
      decreaseLife();

      for (const selectedBlock of nextSelectedBlocks) {
        selectedBlock.state = GameBlockState.INCORRECT;
        scheduleIncorrectReset(selectedBlock.id);
      }

      return true;
    };

    const gameLoop = (timestamp: number) => {
      animationId = requestAnimationFrame(gameLoop);

      if (gameOverRef.current || penaltyGameOverRef.current || isGameFinishedRef.current) {
        return;
      }

      if (lastTimestamp === null) {
        lastTimestamp = timestamp;
        return;
      }

      const deltaSeconds = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
      lastTimestamp = timestamp;

      const minShipX = SHIP_HALF_WIDTH;
      const maxShipX = canvas.width - SHIP_HALF_WIDTH;
      const shipStep = SHIP_MOVE_SPEED * deltaSeconds;
      let moved = false;

      if (pressedKeysRef.current.left && !pressedKeysRef.current.right) {
        localShipRef.current.moveLeft(shipStep, minShipX);
        moved = true;
      } else if (pressedKeysRef.current.right && !pressedKeysRef.current.left) {
        localShipRef.current.moveRight(shipStep, maxShipX);
        moved = true;
      } else {
        localShipRef.current.idle();
      }

      if (moved) {
        sendMessage("/app/move", {
          type: "move",
          playerId: localShipRef.current.playerId,
          x: localShipRef.current.xPosition,
          y: localShipRef.current.yPosition,
        });
      }

      const lerp = 1 - Math.exp(-12 * deltaSeconds);
      remoteShipRef.current.xPosition +=
        (remoteTargetRef.current.x - remoteShipRef.current.xPosition) * lerp;
      remoteShipRef.current.yPosition +=
        (remoteTargetRef.current.y - remoteShipRef.current.yPosition) * lerp;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const groundLimit = canvas.height - BLOCK_STYLE.block.halfSize;
      blocksRef.current = blocksRef.current.filter((block) => {
        if (block.state === GameBlockState.ELIMINATED) {
          return false;
        }

        block.yPosition += FALLING_BLOCK_SPEED * deltaSeconds;

        if (block.yPosition >= groundLimit) {
          selectedBlockIdsRef.current.delete(block.id);
          triggerGameOver("A falling number hit the ground.");
          return false;
        }

        return true;
      });

      for (const block of blocksRef.current) {
        drawBlock(block);
      }

      drawShip(localShipRef.current, "red");
      drawShip(remoteShipRef.current, "cyan");

      const nextBullets: BulletObject[] = [];
      bulletsRef.current = bulletsRef.current.filter((bullet) => !bullet.isOffScreen());

      for (const bullet of bulletsRef.current) {
        bullet.update(deltaSeconds);

        if (bullet.playerId !== localShipRef.current.playerId) {
          if (!bullet.isOffScreen()) {
            nextBullets.push(bullet);
            ctx.fillStyle = BLOCK_STYLE.bullet.fillStyle;
            ctx.fillRect(
              bullet.x - BLOCK_STYLE.bullet.width / 2,
              bullet.y - BLOCK_STYLE.bullet.height,
              BLOCK_STYLE.bullet.width,
              BLOCK_STYLE.bullet.height,
            );
          }
          continue;
        }

        const bulletRect = getBulletRect(bullet);
        let consumed = false;

        for (const block of blocksRef.current) {
          if (block.state === GameBlockState.ELIMINATED) {
            continue;
          }

          if (isOverlapping(bulletRect, getBlockRect(block))) {
            consumed = handleBlockHit(bullet, block);
            break;
          }
        }

        if (!consumed && !bullet.isOffScreen()) {
          nextBullets.push(bullet);
          ctx.fillStyle = BLOCK_STYLE.bullet.fillStyle;
          ctx.fillRect(
            bullet.x - BLOCK_STYLE.bullet.width / 2,
            bullet.y - BLOCK_STYLE.bullet.height,
            BLOCK_STYLE.bullet.width,
            BLOCK_STYLE.bullet.height,
          );
        }
      }

      bulletsRef.current = nextBullets;
      drawHud();
    };

    animationId = requestAnimationFrame(gameLoop);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameOverRef.current || penaltyGameOverRef.current || isGameFinishedRef.current) {
        return;
      }

      if (event.code === "KeyA" || event.code === "ArrowLeft") {
        pressedKeysRef.current.left = true;
      }

      if (event.code === "KeyD" || event.code === "ArrowRight") {
        pressedKeysRef.current.right = true;
      }

      if (event.code === "Space") {
        const x = localShipRef.current.xPosition;
        const y = localShipRef.current.yPosition;
        bulletsRef.current.push(
          new BulletObject({ x, y, playerId: localShipRef.current.playerId }),
        );
        sendMessage("/app/shoot", {
          type: "shoot",
          playerId: localShipRef.current.playerId,
          x,
          y,
        });
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === "KeyA" || event.code === "ArrowLeft") {
        pressedKeysRef.current.left = false;
      }

      if (event.code === "KeyD" || event.code === "ArrowRight") {
        pressedKeysRef.current.right = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      incorrectResetTimeoutsRef.current.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      incorrectResetTimeoutsRef.current.clear();
      if (errorFlashTimeoutRef.current) {
        clearTimeout(errorFlashTimeoutRef.current);
        errorFlashTimeoutRef.current = null;
      }
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(animationId);
    };
  }, [code, completeGame, decreaseLife, increaseScore, scheduleIncorrectReset, sendMessage, triggerGameOver]);

  // UI layout and loading overlay
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "#0a0a0a",
        position: "relative",
      }}
    >
      {isLoadingProblems && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
            zIndex: 10,
            padding: 24,
            textAlign: "center",
          }}
        >
          <div
            style={{
              color: "#00d4ff",
              fontSize: 28,
              fontFamily: "monospace",
              fontWeight: 900,
              letterSpacing: 4,
            }}
          >
            MATH INVADERS
          </div>
          <div style={{ color: loadingError ? "#ff7875" : "#aaa", fontSize: 16, maxWidth: 560 }}>
            {loadingStatus}
          </div>

          {loadingError ? (
            <div style={{ display: "flex", gap: 12 }}>
              <button
                type="button"
                onClick={() => window.location.reload()}
                style={{
                  padding: "10px 18px",
                  backgroundColor: "#00d4ff",
                  color: "#001018",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Retry
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.href = code ? `/session/waiting?code=${code}` : "/menu";
                }}
                style={{
                  padding: "10px 18px",
                  backgroundColor: "#1a1a2e",
                  color: "#e0e0e0",
                  border: "1px solid #444",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Leave Game
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              {[0, 1, 2].map((dot) => (
                <div
                  key={dot}
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: "#00d4ff",
                    animation: `pulse 1.2s ease-in-out ${dot * 0.4}s infinite`,
                  }}
                />
              ))}
            </div>
          )}

          <style>{`@keyframes pulse { 0%,80%,100%{opacity:0.2} 40%{opacity:1} }`}</style>
        </div>
      )}

      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          visibility: isLoadingProblems ? "hidden" : "visible",
        }}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          style={{ border: "1px solid white" }}
        />
        {isErrorFlash && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(220, 0, 0, 0.35)",
              pointerEvents: "none",
            }}
          />
        )}
        {isGameFinished && !isPenaltyGameOver && !isLoadingProblems && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0, 0, 0, 0.68)",
              zIndex: 20,
              padding: 24,
            }}
          >
            <div
              style={{
                width: "min(420px, 100%)",
                padding: 28,
                borderRadius: 16,
                border: "1px solid #1f6f8b",
                backgroundColor: "#08131f",
                color: "#e8f7ff",
                textAlign: "center",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.45)",
              }}
            >
              <div
                style={{
                  color: "#00d4ff",
                  fontFamily: "monospace",
                  fontSize: 28,
                  fontWeight: 900,
                  letterSpacing: 2,
                  marginBottom: 12,
                }}
              >
                Game finished
              </div>
              <div style={{ fontSize: 16, color: "#9bc4d8", marginBottom: 8 }}>
                Final elapsed time
              </div>
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 900,
                  fontFamily: "monospace",
                  color: "#ffffff",
                  marginBottom: 16,
                }}
              >
                {formatElapsedTime(finalElapsedSeconds ?? displayedElapsedSeconds)}
              </div>
              <button
                type="button"
                onClick={() => {
                  window.location.href = "/menu";
                }}
                style={{
                  padding: "12px 18px",
                  border: "none",
                  borderRadius: 10,
                  backgroundColor: "#00d4ff",
                  color: "#031019",
                  fontWeight: 800,
                  cursor: "pointer",
                  minWidth: 140,
                }}
              >
                Leave Game
              </button>
            </div>
          </div>
        )}
        {isPenaltyGameOver && !isLoadingProblems && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0, 0, 0, 0.68)",
              zIndex: 20,
              padding: 24,
            }}
          >
            <div
              style={{
                width: "min(420px, 100%)",
                padding: 28,
                borderRadius: 16,
                border: "1px solid #8b1f1f",
                backgroundColor: "#160b0b",
                color: "#f7eaea",
                textAlign: "center",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.45)",
              }}
            >
              <div
                style={{
                  color: "#ff6b6b",
                  fontFamily: "monospace",
                  fontSize: 28,
                  fontWeight: 900,
                  letterSpacing: 2,
                  marginBottom: 12,
                }}
              >
                Game Over
              </div>
              <div style={{ fontSize: 16, color: "#d8b1b1", marginBottom: 20 }}>
                Shared lives reached zero.
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  style={{
                    padding: "12px 18px",
                    border: "none",
                    borderRadius: 10,
                    backgroundColor: "#ff4d4f",
                    color: "#fff5f5",
                    fontWeight: 800,
                    cursor: "pointer",
                    minWidth: 140,
                  }}
                >
                  Play Again
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = code ? `/session/waiting?code=${code}` : "/menu";
                  }}
                  style={{
                    padding: "12px 18px",
                    border: "1px solid #5b3d3d",
                    borderRadius: 10,
                    backgroundColor: "#241414",
                    color: "#f0e4e4",
                    fontWeight: 800,
                    cursor: "pointer",
                    minWidth: 140,
                  }}
                >
                  Leave Game
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Suspense fallback component
function PlayTestFallback() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0a0a0a",
        color: "#00d4ff",
        fontFamily: "monospace",
        fontSize: 20,
        fontWeight: 900,
        letterSpacing: 3,
      }}
    >
      MATH INVADERS
    </div>
  );
}

// Page export with suspense boundary
export default function PlayTest() {
  return (
    <Suspense fallback={<PlayTestFallback />}>
      <PlayTestContent />
    </Suspense>
  );
}
