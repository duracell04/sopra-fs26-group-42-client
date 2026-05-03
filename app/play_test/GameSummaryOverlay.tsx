"use client";

export type GameSummaryResponse = {
  score: number;
  elapsedSeconds: number;
  newHighscore: boolean;
  feedback: string;
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
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.68)",
        zIndex: 30,
        padding: 24,
      }}
    >
      <div
        style={{
          width: "min(540px, 100%)",
          padding: 28,
          borderRadius: 8,
          border: "1px solid #30456f",
          backgroundColor: "#101a31",
          color: "#f7fbff",
          textAlign: "left",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.45)",
          position: "relative",
        }}
      >
        <button
          type="button"
          aria-label="Return to menu"
          onClick={onReturnToMenu}
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            width: 34,
            height: 34,
            borderRadius: 999,
            border: "1px solid #3e5888",
            backgroundColor: "#16213e",
            color: "#e8f1ff",
            cursor: "pointer",
            fontSize: 20,
            lineHeight: "28px",
          }}
        >
          X
        </button>

        <div
          style={{
            color: "#00d4ff",
            fontFamily: "monospace",
            fontSize: 14,
            fontWeight: 900,
            letterSpacing: 3,
            marginBottom: 8,
            textTransform: "uppercase",
          }}
        >
          Game Summary
        </div>
        <div style={{ fontSize: 30, fontWeight: 900, marginBottom: 20 }}>
          {summaryState.status === "loading" ? "Saving final run..." : "Game Over"}
        </div>

        {summaryState.status === "loading" ? (
          <div style={{ color: "#b6c8e8", fontSize: 16 }}>
            Generating feedback and saving your score.
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
        <div
          style={{
            padding: 12,
            borderRadius: 8,
            border: "1px solid #8b5d23",
            backgroundColor: "#2a2112",
            color: "#ffd786",
            marginBottom: 16,
          }}
        >
          {summaryState.error}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 12,
          marginBottom: 18,
        }}
      >
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
        <div
          style={{
            padding: "10px 12px",
            borderRadius: 8,
            backgroundColor: "#123626",
            border: "1px solid #2f9f70",
            color: "#b8f0d9",
            fontWeight: 800,
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          New Highscore
        </div>
      )}

      <div
        style={{
          padding: 16,
          borderRadius: 8,
          backgroundColor: "#16213e",
          border: "1px solid #30456f",
          color: "#dce8ff",
          lineHeight: 1.5,
          marginBottom: 18,
        }}
      >
        {summaryState.data.feedback}
      </div>

      <button
        type="button"
        onClick={onReturnToMenu}
        style={{
          width: "100%",
          padding: "12px 18px",
          border: "none",
          borderRadius: 8,
          backgroundColor: "#00d4ff",
          color: "#001018",
          fontWeight: 900,
          cursor: "pointer",
        }}
      >
        Return to Menu
      </button>
    </>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 8,
        backgroundColor: "#16213e",
        border: "1px solid #30456f",
      }}
    >
      <div
        style={{
          color: "#98abd2",
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: 1.5,
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div style={{ color: "#fff", fontSize: 24, fontWeight: 900 }}>
        {value}
      </div>
    </div>
  );
}
