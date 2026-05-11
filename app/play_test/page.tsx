"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRequireAuth } from "@/hooks/useAuthGuard";
import { BulletObject } from "@/utils/gameObject/bullet";
import { NumberBlockObject, GameBlockState } from "@/utils/gameObject/gameBlockObject";
import { ShipObject } from "@/utils/gameObject/ship";
import { useApi } from "@/hooks/useApi";
import { useWebSocket } from "@/hooks/useWebSocket";
import { getStoredAuthenticatedUserId } from "@/utils/authStorage";
import { MathProblem } from "@/types/problem";
import { GameSession } from "@/types/session";
import { generateMathProblems, normalizeMathProblems } from "@/utils/mathProblems";
import {
  GameSummaryOverlay,
  type GameSummaryResponse,
  type SummaryState,
} from "@/play_test/GameSummaryOverlay";

//-----------------------------------------------------------------------------
// -------------- Gameplay and session configuration constants ----------------
//-----------------------------------------------------------------------------
const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 720;
const SHIP_HALF_WIDTH = 15;
const SHIP_MOVE_SPEED = 420;
const FALLING_BLOCK_SPEED = 21;
const SESSION_FETCH_RETRIES = 3;
const SESSION_PROBLEM_POLL_LIMIT = 45;
const SESSION_PROBLEM_POLL_INTERVAL_MS = 400;
const INITIAL_LIFE = 3;
const INCORRECT_FLASH_MS = 1000;

const HOST_SHIP_SPRITE_PATH = "/sprites/ship-host.png";
const JOINER_SHIP_SPRITE_PATH = "/sprites/ship-joiner.png";
const SHIP_RENDER_WIDTH = 64;
const SHIP_RENDER_HEIGHT = 64;
const SHIP_RENDER_HALF_WIDTH = SHIP_RENDER_WIDTH / 2;
const SHIP_RENDER_HALF_HEIGHT = SHIP_RENDER_HEIGHT / 2;

const LASER_SOUND_PATH = "/sounds/laser4.wav";
const DESTROYED_SOUND_PATH = "/sounds/explosion.wav";
const SUCCESS_FLASH_MS = 140;
const HUD_MONO_FONT_FAMILY = "\"Geist Mono\", monospace";
const LOCAL_SHIP_START_X = CANVAS_WIDTH / 2;
const LOCAL_SHIP_START_Y = CANVAS_HEIGHT - 70;
const REMOTE_SHIP_START_X = CANVAS_WIDTH / 3;
const REMOTE_SHIP_START_Y = CANVAS_HEIGHT - 70;


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
      font: `700 19px ${HUD_MONO_FONT_FAMILY}`,
      textAlign: "center" as const,
      textBaseline: "middle" as const,
    },
  },
  bullet: { fillStyle: "yellow", width: 4, height: 8 },
};

// Realtime and API payload types
type RealtimeMessage =
|{
  type: "move" | "shoot" | "play_again_ready" | "pause" | "resume" | "game_ready_ack";
  playerId: number;
  x: number;
  y: number;
}
|{
  type: "pair_advance";
  playerId: number;
  x: number;
  y: number;
  pairIndex: number;
  levelIndex: number;
}
|{
  type: "game_state";
  sessionCode: string;
  playerId: number;
  score: number;
  life: number;
  gameOver?: boolean;
  result: "PENDING" | "CORRECT" | "INCORRECT";
  selectedBlockIds: number[];
  blocks: {
    id: number;
    value: number;
    state: "DEFAULT" | "SELECTED" | "ELIMINATED" | "INCORRECT";
  }[];
};

function isLoadedImage(image: HTMLImageElement | null): image is HTMLImageElement {
  return Boolean(image && image.complete && image.naturalWidth > 0);
}

type SessionProblemsResponse = {
  problemsJson?: unknown;
};

type SessionProblemErrorPayload = {
  error?: string;
};

const buildLocalSummary = (
  score: number,
  elapsedSeconds: number,
): GameSummaryResponse => ({
  score,
  elapsedSeconds,
  newHighscore: false,
  feedback:
    `Great run. You scored ${score} points in ${formatElapsedTime(elapsedSeconds)}. ` +
    "Keep focusing on fast factor recognition and avoiding risky shots.",
  totalScore: score,
  highestScore: score,
  timePlayed: elapsedSeconds,
});

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

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getStoredUserId(): number | null {
  return getStoredAuthenticatedUserId();
}

function formatErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
}

// use text to manually generate loadingbar
function getLoadingProgress(status: string, hasError: boolean): number {
  if (hasError) {
    return 100;
  }

  if (status.includes("Ready! Waiting for partner")) {
    return 95;
  }

  if (status.includes("Sharing generated levels with the session")) {
    return 75;
  }

  if (status.includes("Generating levels locally")) {
    return 55;
  }

  if (status.includes("Waiting for host to generate levels")) {
    return 65;
  }

  if (status.startsWith("Loading session")) {
    const retryMatch = status.match(/retry\s+(\d+)\/(\d+)/i);

    if (retryMatch) {
      const attempt = Number(retryMatch[1]);
      const total = Number(retryMatch[2]);

      if (Number.isFinite(attempt) && Number.isFinite(total) && total > 0) {
        const ratio = Math.min(1, Math.max(0, attempt / total));
        return Math.round(20 + ratio * 20);
      }
    }

    return 25;
  }

  if (status === "Loading...") {
    return 12;
  }

  return 40;
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
function buildBlocks(problem: MathProblem): NumberBlockObject[] {
  const horizontalPadding = 88;
  const blockCount = problem.blocks.length;
  const slotSpacing = blockCount > 1
    ? (CANVAS_WIDTH - horizontalPadding * 2) / (blockCount - 1)
    : 0;
  const pairInstanceCounts = new Array(problem.pairs.length).fill(0);

  return problem.blocks.map((block, idx) => {
    const pairOffset = pairInstanceCounts[block.pairIndex];
    pairInstanceCounts[block.pairIndex] += 1;

    return new NumberBlockObject({
      uuid: `block-${block.pairIndex}-${pairOffset}`,
      name: `Block ${idx}`,
      id: block.pairIndex * 2 + pairOffset,
      value: block.value,
      xPosition: Math.round(horizontalPadding + slotSpacing * idx),
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
  useRequireAuth();

  // Section: Router and service hooks
  const searchParams = useSearchParams();
  const code = searchParams.get("code") ?? "";
  const apiService = useApi();

  // Section: Refs for canvas, controls, and entities
  const canvasRef = useRef<HTMLCanvasElement>(null);
	  const bulletsRef = useRef<BulletObject[]>([]);
	  const pressedKeysRef = useRef({ left: false, right: false });

	  const hostShipSpriteRef = useRef<HTMLImageElement | null>(null);
	  const joinerShipSpriteRef = useRef<HTMLImageElement | null>(null);
	  
	  const laserAudioRef = useRef<HTMLAudioElement | null>(null);
	  const destroyedAudioRef = useRef<HTMLAudioElement | null>(null);
  const successFlashUntilRef = useRef<Map<number, number>>(new Map());
  const lastDestroyedSoundAtRef = useRef(0);
  const blockImmunityUntilRef = useRef(0);


  const localShipRef = useRef(
    new ShipObject({
      uuid: "ship-local",
      name: "Player Ship",
      playerId: getStoredUserId() ?? 1,
      xPosition: LOCAL_SHIP_START_X,
      yPosition: LOCAL_SHIP_START_Y,
    }),
  );
  const remoteShipRef = useRef(
    new ShipObject({
      uuid: "ship-remote",
      name: "Partner Ship",
      playerId: -1,
      xPosition: REMOTE_SHIP_START_X,
      yPosition: REMOTE_SHIP_START_Y,
    }),
  );
  const remoteTargetRef = useRef({ x: REMOTE_SHIP_START_X, y: REMOTE_SHIP_START_Y });

  const scoreRef = useRef(0);

  const lifeRef = useRef(INITIAL_LIFE);
  const penaltyGameOverRef = useRef(false);


  // Loading and level progression state
  const [isLoadingProblems, setIsLoadingProblems] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState("Loading...");
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const loadingProgress = getLoadingProgress(loadingStatus, Boolean(loadingError));
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
  const timerSourceMsRef = useRef<number | null>(null);
  const displayedElapsedSecondsRef = useRef(0);
  const finalElapsedSecondsRef = useRef<number | null>(null);
  const isGameFinishedRef = useRef(false);
  
  const finishRequestStartedRef = useRef(false);
  const summaryRequestStartedRef = useRef(false);
  const completeGameRef = useRef<(() => Promise<void>) | null>(null);

  // Play-again ready gate (both players must click before restarting)
  const isLocalCreatorRef = useRef(true);
  const localPlayAgainReadyRef = useRef(false);
  const remotePlayAgainReadyPlayersRef = useRef<Set<number>>(new Set());
  const [playAgainReadyCount, setPlayAgainReadyCount] = useState(0);
  const lastMoveSendRef = useRef(0);

  const isPausedRef = useRef(false);
  const [isPaused, setIsPaused] = useState(false);
  const [summaryState, setSummaryState] = useState<SummaryState>({ status: "idle" });

  // Eliminated block IDs — persists even after blocks are filtered from blocksRef
  const eliminatedBlockIdsRef = useRef<Set<number>>(new Set());

  // Multiplayer game-start handshake: wait for both players to confirm problems loaded
  const gameReadyPlayersRef = useRef<Set<number>>(new Set());
  const problemsAppliedRef = useRef(false);
  const [problemsSentAck, setProblemsSentAck] = useState(false);

  useEffect(() => {
    const loadImage = (src: string) => {
      const image = new Image();
      image.src = src;
      return image;
    };

    const loadAudio = (src: string) => {
      const audio = new Audio(src);
      audio.preload = "auto";
      audio.load();
      return audio;
    };


	    hostShipSpriteRef.current = loadImage(HOST_SHIP_SPRITE_PATH);
	    joinerShipSpriteRef.current = loadImage(JOINER_SHIP_SPRITE_PATH);

	    laserAudioRef.current = loadAudio(LASER_SOUND_PATH);
	    destroyedAudioRef.current = loadAudio(DESTROYED_SOUND_PATH);
  }, []);


  const playSound = useCallback((audio: HTMLAudioElement | null) => {
    if (!audio?.src) {
      return;
    }

    try {
      const sound = audio.cloneNode(true) as HTMLAudioElement;
      sound.preload = "auto";
      void sound.play().catch(() => {
        // Ignore autoplay/playback interruptions.
      });
    } catch (error) {
      console.warn("Sound playback failed:", error);
    }
  }, []);

  const playDestroyedSound = useCallback(() => {
    const now = performance.now();

    if (now - lastDestroyedSoundAtRef.current < 250) {
      return;
    }

    lastDestroyedSoundAtRef.current = now;
    playSound(destroyedAudioRef.current);
  }, [playSound]);


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


const syncPairProgressFromBlocks = useCallback((): boolean => {
  const currentProblem = problemsRef.current[currentLevelRef.current];
  if (!currentProblem) {
    return false;
  }

  const elimCountByPair = new Map<number, number>();
  for (const blockId of eliminatedBlockIdsRef.current) {
    const pairIdx = Math.floor(blockId / 2);
    elimCountByPair.set(pairIdx, (elimCountByPair.get(pairIdx) ?? 0) + 1);
  }

  const completedPairSet = new Set<number>();
  for (const [pairIdx, count] of elimCountByPair) {
    if (count >= 2) completedPairSet.add(pairIdx);
  }

  if (completedPairSet.size >= currentProblem.pairs.length) {
    const nextLevel = currentLevelRef.current + 1;

    if (nextLevel < problemsRef.current.length) {
      currentLevelRef.current = nextLevel;
      currentPairIndexRef.current = 0;
      selectedBlockIdsRef.current.clear();
      eliminatedBlockIdsRef.current.clear();
      blocksRef.current = buildBlocks(problemsRef.current[nextLevel]);
      bulletsRef.current = [];
      return false;
    }

    return true;
  }

  for (let i = 0; i < currentProblem.pairs.length; i++) {
    if (!completedPairSet.has(i)) {
      currentPairIndexRef.current = i;
      return false;
    }
  }

  return false;
}, []);

  const finishGameWithSummary = useCallback(async (elapsedOverride?: number) => {
    if (summaryRequestStartedRef.current) {
      return;
    }

    summaryRequestStartedRef.current = true;
    const score = scoreRef.current;
    const elapsedSeconds = Math.max(
      0,
      elapsedOverride ?? finalElapsedSecondsRef.current ?? displayedElapsedSecondsRef.current,
    );
    const livesRemaining = lifeRef.current;

    setSummaryState({ status: "loading" });

    if (!code) {
      setSummaryState({
        status: "ready",
        data: buildLocalSummary(score, elapsedSeconds),
        source: "local",
      });
      return;
    }

    const userId = getStoredUserId();
    if (!userId) {
      setSummaryState({
        status: "error",
        data: buildLocalSummary(score, elapsedSeconds),
        error: "Missing player session. Final stats could not be saved.",
        source: "local",
      });
      return;
    }

    try {
      const summary = await apiService.post<GameSummaryResponse>(`/sessions/${code}/summary`, {
        userId,
        score,
        elapsedSeconds,
        livesRemaining,
      });
      setSummaryState({ status: "ready", data: summary, source: "backend" });
    } catch (error) {
      setSummaryState({
        status: "error",
        data: buildLocalSummary(score, elapsedSeconds),
        error: formatErrorMessage(error, "Final stats could not be saved."),
        source: "local",
      });
    }
  }, [apiService, code]);

  // Realtime message handler
  const handleMessage = useCallback((message: unknown) => {
    const data = message as Partial<RealtimeMessage>;

    if (data.type === "game_state") {
      if (
        typeof data.score !== "number" ||
        typeof data.life !== "number" ||
        !Array.isArray(data.blocks)
      ) {
        return;
      }

      scoreRef.current = data.score;
      lifeRef.current = data.life;
      setScoreUi(data.score);
      setLifeUi(data.life);

      if (data.gameOver || data.life <= 0) {
        penaltyGameOverRef.current = true;
        pressedKeysRef.current.left = false;
        pressedKeysRef.current.right = false;
        setIsPenaltyGameOver(true);
        void finishGameWithSummary();
      }

      let shouldPlayDestroyedSound = false;
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
            if (existingBlock.state !== GameBlockState.ELIMINATED) {
              successFlashUntilRef.current.set(
                existingBlock.id,
                performance.now() + SUCCESS_FLASH_MS,
              );
              shouldPlayDestroyedSound = true;
            }
            existingBlock.state = GameBlockState.ELIMINATED;
            eliminatedBlockIdsRef.current.add(existingBlock.id);
            break;
          case "INCORRECT":
            existingBlock.state = GameBlockState.INCORRECT;
            scheduleIncorrectReset(existingBlock.id);
            break;
        }

        return existingBlock;
      });

      blocksRef.current = nextBlocks;
      if (shouldPlayDestroyedSound) {
        playDestroyedSound();
      }
      selectedBlockIdsRef.current = new Set(data.selectedBlockIds ?? []);
      const didFinishFromRemoteState = syncPairProgressFromBlocks();
      if (didFinishFromRemoteState) {
        void completeGameRef.current?.();
      }
      return;
    }

    if (data.type === "play_again_ready" && typeof data.playerId === "number") {
      if (data.playerId !== localShipRef.current.playerId) {
        remotePlayAgainReadyPlayersRef.current.add(data.playerId);
        const total = (localPlayAgainReadyRef.current ? 1 : 0) + remotePlayAgainReadyPlayersRef.current.size;
        setPlayAgainReadyCount(total);
        if (total >= 2) {
          window.location.reload();
        }
      }
      return;
    }

    // All control messages below are ignored when echoed back from self
    const isFromSelf = typeof data.playerId === "number" && data.playerId === localShipRef.current.playerId;

    if (data.type === "game_ready_ack" && typeof data.playerId === "number") {
      gameReadyPlayersRef.current.add(data.playerId);
      if (gameReadyPlayersRef.current.size >= 2 && problemsAppliedRef.current) {
        setIsLoadingProblems(false);
        if (timerSourceMsRef.current === null) {
          const now = Date.now();
          timerSourceMsRef.current = now;
          setTimerSourceMs(now);
        }
      }
      return;
    }

    if (data.type === "pause" && !isFromSelf) {
      isPausedRef.current = true;
      setIsPaused(true);
      return;
    }

    if (data.type === "resume" && !isFromSelf) {
      isPausedRef.current = false;
      setIsPaused(false);
      return;
    }

    if (data.type === "pair_advance" && !isFromSelf && typeof (data as { pairIndex?: number }).pairIndex === "number") {
      const msg = data as { pairIndex: number; levelIndex: number };
      if (msg.levelIndex === currentLevelRef.current) {
        currentPairIndexRef.current = msg.pairIndex;
        selectedBlockIdsRef.current.clear();
      } else if (msg.levelIndex > currentLevelRef.current && msg.levelIndex < problemsRef.current.length) {
        currentLevelRef.current = msg.levelIndex;
        currentPairIndexRef.current = msg.pairIndex;
        selectedBlockIdsRef.current.clear();
        eliminatedBlockIdsRef.current.clear();
        blocksRef.current = buildBlocks(problemsRef.current[msg.levelIndex]);
      }
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
    playSound(laserAudioRef.current);
  }, [finishGameWithSummary, playDestroyedSound, playSound, scheduleIncorrectReset, syncPairProgressFromBlocks]);
  

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
      void finishGameWithSummary();
    }
  }, [finishGameWithSummary]);

  const resetRoundStats = useCallback(() => {
    scoreRef.current = 0;
    lifeRef.current = INITIAL_LIFE;
    penaltyGameOverRef.current = false;
    gameOverRef.current = false;
    isGameFinishedRef.current = false;
    finishRequestStartedRef.current = false;
    summaryRequestStartedRef.current = false;
    setScoreUi(0);
    setLifeUi(INITIAL_LIFE);
    setIsPenaltyGameOver(false);
    setIsErrorFlash(false);
    setDisplayedElapsedSeconds(0);
    setFinalElapsedSeconds(null);
    setIsGameFinished(false);
    setSummaryState({ status: "idle" });
  }, []);

  const triggerGameOver = useCallback((message: string) => {
    if (gameOverRef.current) {
      return;
    }

    gameOverRef.current = true;
    setLoadingStatus("Game Over");
    setLoadingError(message);
    penaltyGameOverRef.current = true;
    pressedKeysRef.current.left = false;
    pressedKeysRef.current.right = false;
    setIsPenaltyGameOver(true);
    setIsLoadingProblems(false);
    void finishGameWithSummary();
  }, [finishGameWithSummary]);

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
    eliminatedBlockIdsRef.current.clear();
    blocksRef.current = buildBlocks(problems[0]);

    resetRoundStats();
    incorrectResetTimeoutsRef.current.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    incorrectResetTimeoutsRef.current.clear();

    setLoadingError(null);
    problemsAppliedRef.current = true;

    if (!code) {
      // Solo: start immediately
      setIsLoadingProblems(false);
      if (timerSourceMsRef.current === null) {
        const startedAtMs = Date.now();
        timerSourceMsRef.current = startedAtMs;
        setTimerSourceMs(startedAtMs);
      }
    } else {
      // Multiplayer: wait for both players to confirm they're ready.
      // Do NOT clear gameReadyPlayersRef — the partner's ack may have
      // already arrived before our own applyProblems ran.
      setLoadingStatus("Ready! Waiting for partner...");
      setProblemsSentAck(true);
    }
  }, [code, resetRoundStats]);

  // WebSocket integration
  const { sendMessage } = useWebSocket(handleMessage);

  const handlePlayAgainReady = useCallback(() => {
    if (!code) {
      window.location.reload();
      return;
    }
    if (localPlayAgainReadyRef.current) return;
    localPlayAgainReadyRef.current = true;
    const total = 1 + remotePlayAgainReadyPlayersRef.current.size;
    setPlayAgainReadyCount(total);
    sendMessage("/app/move", {
      type: "play_again_ready",
      playerId: localShipRef.current.playerId,
      x: 0,
      y: 0,
    });
    if (total >= 2) {
      window.location.reload();
    }
  }, [code, sendMessage]);

  const handlePauseToggle = useCallback(() => {
    const next = !isPausedRef.current;
    isPausedRef.current = next;
    setIsPaused(next);
    if (code) {
      sendMessage("/app/move", { type: next ? "pause" : "resume", playerId: localShipRef.current.playerId, x: 0, y: 0 });
    }
  }, [code, sendMessage]);

  // Broadcast game_ready_ack for 10 seconds after problems are ready.
  // The partner may unlock and stop sending their own acks very quickly (because
  // our acks arrived before they finished loading), so we must keep broadcasting
  // long enough for them to still receive at least one of ours.
  useEffect(() => {
    if (!problemsSentAck || !code) return;
    let remaining = 20; // 20 × 500 ms = 10 s
    const send = () =>
      sendMessage("/app/move", {
        type: "game_ready_ack",
        playerId: localShipRef.current.playerId,
        x: 0,
        y: 0,
      });
    send();
    const interval = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(interval);
        return;
      }
      send();
    }, 500);
    return () => clearInterval(interval);
  }, [problemsSentAck, code, sendMessage]);

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

    if (!code) {
      void finishGameWithSummary(fallbackElapsedSeconds);
      return;
    }

    if (finishRequestStartedRef.current) {
      void finishGameWithSummary(fallbackElapsedSeconds);
      return;
    }

    const userId = getStoredUserId();
    if (!userId) {
      void finishGameWithSummary(fallbackElapsedSeconds);
      return;
    }

    finishRequestStartedRef.current = true;

    try {
      await apiService.post<GameSession>(`/sessions/${code}/finish`, {
        userId,
      });

      freezeTimer(fallbackElapsedSeconds);
      void finishGameWithSummary(fallbackElapsedSeconds);
    } catch (error) {
      console.warn("Failed to synchronize finished session timer:", error);
      void finishGameWithSummary(fallbackElapsedSeconds);
    }
  }, [apiService, code, finishGameWithSummary, freezeTimer]);

  completeGameRef.current = completeGame;

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
      isLocalCreatorRef.current = true;
    };

    const configureAsJoiner = (currentUserId: number, creatorId: number) => {
      localShipRef.current.playerId = currentUserId;
      remoteShipRef.current.playerId = creatorId;
      isLocalCreatorRef.current = false;
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
	      const successFlashUntil = successFlashUntilRef.current.get(block.id);
	      const isSuccessFlashing =
        block.state === GameBlockState.ELIMINATED &&
        typeof successFlashUntil === "number" &&
        successFlashUntil > performance.now();

	      if (block.state === GameBlockState.ELIMINATED && !isSuccessFlashing) {
	        return;
	      }

	      ctx.save();
	      ctx.translate(block.xPosition, block.yPosition);

	      const hullColor = isSuccessFlashing
	        ? "#7ff3a9"
	        : block.state === GameBlockState.SELECTED
	          ? "#ffd786"
	          : block.state === GameBlockState.INCORRECT
	            ? "#ff9d9d"
	            : "#476b9a";
	      const domeColor = isSuccessFlashing
	        ? "#d6ffea"
	        : block.state === GameBlockState.SELECTED
	          ? "#fff0c2"
	          : block.state === GameBlockState.INCORRECT
	            ? "#ffe1e1"
	            : "#7fa6d2";
	      const glowColor = isSuccessFlashing
	        ? "rgba(127, 243, 169, 0.45)"
	        : block.state === GameBlockState.SELECTED
	          ? "rgba(255, 215, 134, 0.38)"
	          : block.state === GameBlockState.INCORRECT
	            ? "rgba(255, 107, 107, 0.34)"
	            : "rgba(90, 138, 196, 0.28)";

	      ctx.fillStyle = glowColor;
	      ctx.beginPath();
	      ctx.ellipse(0, 20, 39, 9, 0, 0, Math.PI * 2);
	      ctx.fill();

	      ctx.shadowColor = glowColor;
	      ctx.shadowBlur = 24;

	      ctx.fillStyle = hullColor;
	      ctx.beginPath();
	      ctx.ellipse(0, 5, 36, 16, 0, 0, Math.PI * 2);
	      ctx.fill();
	      ctx.strokeStyle = "rgba(6, 18, 34, 0.72)";
	      ctx.lineWidth = 2;
	      ctx.stroke();

	      ctx.shadowBlur = 14;
	      ctx.fillStyle = domeColor;
	      ctx.beginPath();
	      ctx.ellipse(0, -8, 20, 13, 0, Math.PI, 0, true);
	      ctx.closePath();
	      ctx.fill();

	      const windowColors = ["#4ed3ff", "#ffd786", "#4ed3ff"];
	      for (let i = -1; i <= 1; i += 1) {
	        ctx.fillStyle = windowColors[i + 1];
	        ctx.beginPath();
	        ctx.arc(i * 13, 5, 4.3, 0, Math.PI * 2);
	        ctx.fill();
	      }

	      ctx.fillStyle = BLOCK_STYLE.block.text.fillStyle;
	      ctx.font = "14px 'Press Start 2P', monospace";
	      ctx.textAlign = BLOCK_STYLE.block.text.textAlign;
	      ctx.textBaseline = BLOCK_STYLE.block.text.textBaseline;
	      ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
	      ctx.shadowBlur = 6;
	      ctx.fillText(String(block.value), 0, 5);
	      ctx.restore();
	    };


    const drawBackground = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const drawShip = (
      ship: ShipObject,
      sprite: HTMLImageElement | null,
      fallbackColor: string,
    ) => {
      if (isLoadedImage(sprite)) {
        ctx.drawImage(
          sprite,
          ship.xPosition - SHIP_RENDER_HALF_WIDTH,
          ship.yPosition - SHIP_RENDER_HALF_HEIGHT,
          SHIP_RENDER_WIDTH,
          SHIP_RENDER_HEIGHT,
        );
        return;
      }

      ctx.fillStyle = fallbackColor;
      ctx.beginPath();
      ctx.moveTo(ship.xPosition, ship.yPosition - 20);
      ctx.lineTo(ship.xPosition - SHIP_HALF_WIDTH, ship.yPosition + 10);
      ctx.lineTo(ship.xPosition + SHIP_HALF_WIDTH, ship.yPosition + 10);
      ctx.closePath();
      ctx.fill();
    };

	    const broadcastPairAdvance = (pairIndex: number, levelIndex: number) => {
	      if (!code) return;
      sendMessage("/app/move", {
        type: "pair_advance",
        playerId: localShipRef.current.playerId,
        x: 0,
        y: 0,
        pairIndex,
        levelIndex,
      });
    };

    const advancePair = () => {
      selectedBlockIdsRef.current.clear();
      const currentProblem = problemsRef.current[currentLevelRef.current];
      const pairCount = currentProblem?.pairs.length ?? 5;
      const nextPair = currentPairIndexRef.current + 1;
      if (nextPair >= pairCount) {
        const nextLevel = currentLevelRef.current + 1;

        if (nextLevel >= problemsRef.current.length) {
          return true;
        }

        currentLevelRef.current = nextLevel;
        currentPairIndexRef.current = 0;
        eliminatedBlockIdsRef.current.clear();
        blocksRef.current = buildBlocks(problemsRef.current[nextLevel]);
        bulletsRef.current = [];
        blockImmunityUntilRef.current = performance.now() + 2000;
        broadcastPairAdvance(0, nextLevel);
        return false;
      }

      currentPairIndexRef.current = nextPair;
      broadcastPairAdvance(nextPair, currentLevelRef.current);

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

      if (performance.now() < blockImmunityUntilRef.current) {
        return true;
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

      sendMessage("/app/block/select", {
        sessionCode: code,
        userId: getStoredUserId(),
        blockId: block.id,
        blockValue: block.value,
        targetProduct: targetPair.product,
        selectionWindowMs: INCORRECT_FLASH_MS,
      });

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
        const successUntil = performance.now() + SUCCESS_FLASH_MS;

        for (const selectedBlock of nextSelectedBlocks) {
          successFlashUntilRef.current.set(selectedBlock.id, successUntil);
          selectedBlock.eliminate();
          eliminatedBlockIdsRef.current.add(selectedBlock.id);
        }

        playDestroyedSound();
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

      if (isPausedRef.current) {
        lastTimestamp = null;
        return;
      }

      if (lastTimestamp === null) {
        lastTimestamp = timestamp;
        return;
      }

      const deltaSeconds = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
      lastTimestamp = timestamp;

      const minShipX = SHIP_RENDER_HALF_WIDTH;
      const maxShipX = canvas.width - SHIP_RENDER_HALF_WIDTH;
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
        const nowMs = performance.now();
        if (nowMs - lastMoveSendRef.current > 50) {
          lastMoveSendRef.current = nowMs;
          sendMessage("/app/move", {
            type: "move",
            playerId: localShipRef.current.playerId,
            x: localShipRef.current.xPosition,
            y: localShipRef.current.yPosition,
          });
        }
      }

      const lerp = 1 - Math.exp(-18 * deltaSeconds);
      remoteShipRef.current.xPosition +=
        (remoteTargetRef.current.x - remoteShipRef.current.xPosition) * lerp;
      remoteShipRef.current.yPosition +=
        (remoteTargetRef.current.y - remoteShipRef.current.yPosition) * lerp;

      drawBackground();

      const groundLimit = canvas.height - BLOCK_STYLE.block.halfSize;
      blocksRef.current = blocksRef.current.filter((block) => {
        if (block.state === GameBlockState.ELIMINATED) {
          const successFlashUntil = successFlashUntilRef.current.get(block.id);

          if (
            typeof successFlashUntil === "number" &&
            successFlashUntil > timestamp
          ) {
            return true;
          }

          successFlashUntilRef.current.delete(block.id);
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

      const localShipSprite = isLocalCreatorRef.current
        ? hostShipSpriteRef.current
        : joinerShipSpriteRef.current;
      const remoteShipSprite = isLocalCreatorRef.current
        ? joinerShipSpriteRef.current
        : hostShipSpriteRef.current;
      drawShip(localShipRef.current, localShipSprite, isLocalCreatorRef.current ? "#ff4d4f" : "#3d85ff");
      drawShip(remoteShipRef.current, remoteShipSprite, isLocalCreatorRef.current ? "#3d85ff" : "#ff4d4f");

      const nextBullets: BulletObject[] = [];
      bulletsRef.current = bulletsRef.current.filter((bullet) => !bullet.isOffScreen());

      for (const bullet of bulletsRef.current) {
        bullet.update(deltaSeconds);

        // if (bullet.playerId !== localShipRef.current.playerId) {
        //   if (!bullet.isOffScreen()) {
        //     nextBullets.push(bullet);
        //     ctx.fillStyle = BLOCK_STYLE.bullet.fillStyle;
        //     ctx.fillRect(
        //       bullet.x - BLOCK_STYLE.bullet.width / 2,
        //       bullet.y - BLOCK_STYLE.bullet.height,
        //       BLOCK_STYLE.bullet.width,
        //       BLOCK_STYLE.bullet.height,
        //     );
        //   }
        //   continue;
        // }

        const bulletRect = getBulletRect(bullet);
        let consumed = false;
        let hitBlock: NumberBlockObject | null = null;

        for (const block of blocksRef.current) {
          if (block.state === GameBlockState.ELIMINATED) {
            continue;
          }

          if (isOverlapping(bulletRect, getBlockRect(block))) {
            hitBlock = block;
            break;
          }
        }

        if (hitBlock) {
          if (bullet.playerId === localShipRef.current.playerId) {
            consumed = handleBlockHit(bullet, hitBlock);
          } else {
            // Remote bullets should disappear on collision as well; block state
            // changes remain synchronized via websocket game_state messages.
            consumed = true;
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
	    };

    animationId = requestAnimationFrame(gameLoop);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "KeyP") {
        const next = !isPausedRef.current;
        isPausedRef.current = next;
        setIsPaused(next);
        if (code) {
          sendMessage("/app/move", { type: next ? "pause" : "resume", playerId: localShipRef.current.playerId, x: 0, y: 0 });
        }
        return;
      }

      if (gameOverRef.current || penaltyGameOverRef.current || isGameFinishedRef.current || isPausedRef.current) {
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
        playSound(laserAudioRef.current);
        sendMessage("/app/shoot", {
          type: "shoot",
          playerId: localShipRef.current.playerId,
          x,
          y,
        });
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const wasLeft = pressedKeysRef.current.left;
      const wasRight = pressedKeysRef.current.right;

      if (event.code === "KeyA" || event.code === "ArrowLeft") {
        pressedKeysRef.current.left = false;
      }

      if (event.code === "KeyD" || event.code === "ArrowRight") {
        pressedKeysRef.current.right = false;
      }

      // Send final position when player stops so remote snaps to correct spot
      if ((wasLeft || wasRight) && !pressedKeysRef.current.left && !pressedKeysRef.current.right) {
        sendMessage("/app/move", {
          type: "move",
          playerId: localShipRef.current.playerId,
          x: localShipRef.current.xPosition,
          y: localShipRef.current.yPosition,
        });
        lastMoveSendRef.current = performance.now();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      incorrectResetTimeoutsRef.current.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      incorrectResetTimeoutsRef.current.clear();
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(animationId);
    };
  }, [code, completeGame, decreaseLife, increaseScore, playDestroyedSound, playSound, scheduleIncorrectReset, sendMessage, triggerGameOver]);

  const currentProblem = problemsRef.current[currentLevelRef.current];
  const currentPair = currentProblem?.pairs[currentPairIndexRef.current];
  const currentTarget = currentPair?.product ?? "--";
  const leaveGameHref = code ? `/session/waiting?code=${code}` : "/menu";
  const playAgainLabel = code && localPlayAgainReadyRef.current
    ? `Ready ${playAgainReadyCount}/2`
    : "Play Again";

  return (
    <div className="game-shell">
      <div className="game-external-controls">
        <button
          type="button"
          className="game-control-button"
          onClick={() => {
            window.location.href = "/menu";
          }}
        >
          Menu
        </button>

        {!isGameFinished && !isPenaltyGameOver && (
          <button
            type="button"
            className={`game-control-button${isPaused ? " game-control-button--warning" : ""}`}
            onClick={handlePauseToggle}
            title="Pause / Resume (P)"
          >
            {isPaused ? "Resume" : "Pause"}
          </button>
        )}
      </div>

      <div className="game-stage-frame">
        <div
          className={`game-stage-frame__content${
            isLoadingProblems && summaryState.status === "idle" ? " game-stage-frame__content--hidden" : ""
          }`}
        >
          <div className="game-stage">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="game-canvas"
            />

            <div className="game-stage-hud" aria-hidden="true">
              <div className="game-stage-hud__cluster game-stage-hud__cluster--left">
                <div className="game-stage-hud__metric">
                  <span className="game-stage-hud__label">Level</span>
                  <strong className="game-stage-hud__value">
                    {problemsRef.current.length ? currentLevelRef.current + 1 : "--"}
                  </strong>
                </div>
                <div className="game-stage-hud__metric">
                  <span className="game-stage-hud__label">Score</span>
                  <strong className="game-stage-hud__value">{scoreUi}</strong>
                </div>
                <div className="game-stage-hud__metric">
                  <span className="game-stage-hud__label">Lives</span>
                  <strong className="game-stage-hud__value game-stage-hud__value--danger">{lifeUi}</strong>
                </div>
              </div>

              <div className="game-stage-hud__target">
                <span className="game-stage-hud__label">Target Product</span>
                <strong className="game-stage-hud__target-value">{currentTarget}</strong>
              </div>

              <div className="game-stage-hud__cluster game-stage-hud__cluster--right">
                <div className="game-stage-hud__metric">
                  <span className="game-stage-hud__label">TIME</span>
                  <strong className="game-stage-hud__value">
                    {formatElapsedTime(finalElapsedSeconds ?? displayedElapsedSeconds)}
                  </strong>
                </div>
              </div>
            </div>

            {isErrorFlash && <div className="game-stage-flash" />}
          </div>
        </div>

        {isPaused && !isGameFinished && !isPenaltyGameOver && (
          <div className="game-overlay">
            <div className="game-modal">
              <div className="game-modal__kicker game-modal__kicker--warm">Pause Menu</div>
              <h2 className="game-modal__title">Systems on standby</h2>
              <p className="game-modal__subtitle">
                Press <span className="game-inline-key">P</span> or use Resume to jump back in.
              </p>

              <div className="game-modal__actions">
                <button
                  type="button"
                  className="game-button game-button--warning"
                  onClick={handlePauseToggle}
                >
                  Resume Run
                </button>
                <button
                  type="button"
                  className="game-button game-button--ghost"
                  onClick={() => {
                    window.location.href = "/menu";
                  }}
                >
                  Return to Menu
                </button>
              </div>
            </div>
          </div>
        )}

        {isGameFinished && !isPenaltyGameOver && !isLoadingProblems && summaryState.status === "idle" && (
          <div className="game-overlay">
            <div className="game-modal">
              <div className="game-modal__kicker">Stage Clear</div>
              <h2 className="game-modal__title">Target zone secured</h2>
              <p className="game-modal__subtitle">Final elapsed time</p>
              <div className="game-modal__time">
                {formatElapsedTime(finalElapsedSeconds ?? displayedElapsedSeconds)}
              </div>

              <div className="game-modal__actions">
                <button
                  type="button"
                  className="game-button game-button--accent"
                  onClick={handlePlayAgainReady}
                  disabled={localPlayAgainReadyRef.current}
                >
                  {playAgainLabel}
                </button>
                <button
                  type="button"
                  className="game-button game-button--ghost"
                  onClick={() => {
                    window.location.href = "/menu";
                  }}
                >
                  Leave Game
                </button>
              </div>
            </div>
          </div>
        )}

        {isPenaltyGameOver && !isLoadingProblems && summaryState.status === "idle" && (
          <div className="game-overlay">
            <div className="game-modal game-modal--danger">
              <div className="game-modal__kicker game-modal__kicker--danger">Game Over</div>
              <h2 className="game-modal__title">Shared shields depleted</h2>
              <p className="game-modal__subtitle game-modal__subtitle--danger">
                Your team lost all remaining lives before clearing the stage.
              </p>

              <div className="game-modal__actions">
                <button
                  type="button"
                  className="game-button game-button--danger"
                  onClick={handlePlayAgainReady}
                  disabled={localPlayAgainReadyRef.current}
                >
                  {playAgainLabel}
                </button>
                <button
                  type="button"
                  className="game-button game-button--ghost"
                  onClick={() => {
                    window.location.href = "/menu";
                  }}
                >
                  Leave Game
                </button>
              </div>
            </div>
          </div>
        )}

        {summaryState.status !== "idle" && (
          <GameSummaryOverlay
            summaryState={summaryState}
            formatElapsedTime={formatElapsedTime}
            onReturnToMenu={() => {
              window.location.href = "/menu";
            }}
          />
        )}
      </div>

      {isLoadingProblems && summaryState.status === "idle" && (
        <div className="game-overlay game-overlay--fullscreen">
          <div className={`game-modal game-modal--wide${loadingError ? " game-modal--danger" : ""}`}>
            <div className={`game-modal__kicker${loadingError ? " game-modal__kicker--danger" : ""}`}>
              Math Invaders
            </div>
            <h2 className="game-modal__title">
              {loadingError ? "Launch interrupted" : "Preparing the battle grid"}
            </h2>
            <p className={`game-modal__subtitle game-modal__subtitle--compact${loadingError ? " game-modal__subtitle--danger" : ""}`}>
              {loadingStatus}
            </p>

            <div className="game-loading-bar">
              <div
                className={`game-loading-bar__fill${loadingError ? " game-loading-bar__fill--danger" : ""}`}
                style={{ width: `${loadingProgress}%` }}
              />
            </div>

            <div className="game-loading-percent">{loadingProgress}% synced</div>

            {loadingError ? (
              <div className="game-modal__actions">
                <button
                  type="button"
                  className="game-button game-button--accent"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </button>
                <button
                  type="button"
                  className="game-button game-button--ghost"
                  onClick={() => {
                    window.location.href = leaveGameHref;
                  }}
                >
                  Leave Game
                </button>
              </div>
            ) : (
              <div className="game-loading-dots" aria-hidden="true">
                {[0, 1, 2].map((dot) => (
                  <span
                    key={dot}
                    className="game-loading-dot"
                    style={{ animationDelay: `${dot * 0.18}s` }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Suspense fallback component
function PlayTestFallback() {
  return (
    <div className="game-shell game-shell--fallback">
      <div className="game-fallback-wordmark">MATH INVADERS</div>
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
