"use client";

export type GameSummaryResponse = {
  score: number;
  elapsedSeconds: number;
  newHighscore: boolean;
  feedback: string;
  tip?: string;
  feedbackSource?: "OPENROUTER" | "FALLBACK";
  totalScore: number;
  highestScore: number;
  timePlayed: number;
};

export type SummaryState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; data: GameSummaryResponse; source: "backend" | "local" }
  | { status: "error"; data: GameSummaryResponse; error: string; source: "local" };

type GameSummaryOverlayProps = {
  summaryState: Exclude<SummaryState, { status: "idle" }>;
  formatElapsedTime: (totalSeconds: number) => string;
  onReturnToMenu: () => void;
};

export function GameSummaryOverlay({
  summaryState,
  formatElapsedTime,
  onReturnToMenu,
}: GameSummaryOverlayProps) {
  return (
    <div className="game-overlay">
      <div className="game-modal game-modal--wide">
        <button
          type="button"
          aria-label="Return to menu"
          className="game-modal__close"
          onClick={onReturnToMenu}
        >
          x
        </button>

        <div className="game-modal__kicker">Game Summary</div>
        <h2 className="game-modal__title">
          {summaryState.status === "loading" ? "Saving final run..." : "Game Over"}
        </h2>

        {summaryState.status === "loading" ? (
          <div className="game-summary-loading" role="status" aria-live="polite">
            <p className="game-modal__subtitle">
              Saving score and generating feedback...
            </p>
            <p className="game-summary-loading__hint">This can take a few seconds.</p>
            <div className="game-summary-loading__bar" aria-hidden="true">
              <div className="game-summary-loading__bar-fill" />
            </div>
          </div>
        ) : (
          <SummaryContent
            summaryState={summaryState}
            formatElapsedTime={formatElapsedTime}
            onReturnToMenu={onReturnToMenu}
          />
        )}
      </div>
    </div>
  );
}

function SummaryContent({
  summaryState,
  formatElapsedTime,
  onReturnToMenu,
}: {
  summaryState: Exclude<SummaryState, { status: "idle" | "loading" }>;
  formatElapsedTime: (totalSeconds: number) => string;
  onReturnToMenu: () => void;
}) {
  return (
    <>
      {summaryState.status === "error" && (
        <div className="game-error-banner">Error: {summaryState.error}</div>
      )}

      <div className="game-summary-grid">
        <SummaryMetric label="Score" value={String(summaryState.data.score)} />
        <SummaryMetric label="Time" value={formatElapsedTime(summaryState.data.elapsedSeconds)} />
        {summaryState.source === "backend" && (
          <>
            <SummaryMetric label="Highest" value={String(summaryState.data.highestScore)} />
            <SummaryMetric label="Total" value={String(summaryState.data.totalScore)} />
          </>
        )}
      </div>

      {summaryState.source === "backend" && summaryState.data.newHighscore && (
        <div className="game-summary-banner">New Highscore</div>
      )}

      <div className="game-summary-feedback">{summaryState.data.feedback}</div>

      {summaryState.data.tip && (
        <div className="game-summary-tip">
          <span className="game-summary-tip__label">Next round</span>
          {summaryState.data.tip}
        </div>
      )}

      <button
        type="button"
        className="game-button game-button--accent game-button--full"
        onClick={onReturnToMenu}
      >
        Return to Menu
      </button>
    </>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="game-summary-metric">
      <div className="game-summary-metric__label">{label}</div>
      <div className="game-summary-metric__value">{value}</div>
    </div>
  );
}
