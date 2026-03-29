const stars = [
  { top: "5%", left: "8%", size: 10, opacity: 0.9 },
  { top: "12%", left: "23%", size: 7, opacity: 0.6 },
  { top: "3%", left: "47%", size: 12, opacity: 0.8 },
  { top: "8%", left: "68%", size: 8, opacity: 0.7 },
  { top: "15%", left: "85%", size: 10, opacity: 0.9 },
  { top: "22%", left: "5%", size: 7, opacity: 0.5 },
  { top: "18%", left: "35%", size: 9, opacity: 0.8 },
  { top: "25%", left: "57%", size: 6, opacity: 0.6 },
  { top: "20%", left: "77%", size: 11, opacity: 0.7 },
  { top: "32%", left: "15%", size: 8, opacity: 0.9 },
  { top: "38%", left: "42%", size: 7, opacity: 0.5 },
  { top: "30%", left: "63%", size: 10, opacity: 0.8 },
  { top: "35%", left: "90%", size: 8, opacity: 0.6 },
  { top: "45%", left: "3%", size: 11, opacity: 0.7 },
  { top: "42%", left: "28%", size: 7, opacity: 0.9 },
  { top: "48%", left: "72%", size: 9, opacity: 0.6 },
  { top: "55%", left: "18%", size: 8, opacity: 0.8 },
  { top: "52%", left: "50%", size: 12, opacity: 0.5 },
  { top: "58%", left: "82%", size: 7, opacity: 0.9 },
  { top: "65%", left: "8%", size: 10, opacity: 0.7 },
  { top: "62%", left: "38%", size: 8, opacity: 0.6 },
  { top: "68%", left: "60%", size: 11, opacity: 0.8 },
  { top: "70%", left: "92%", size: 7, opacity: 0.5 },
  { top: "75%", left: "22%", size: 9, opacity: 0.9 },
  { top: "78%", left: "48%", size: 8, opacity: 0.7 },
  { top: "72%", left: "75%", size: 10, opacity: 0.6 },
  { top: "85%", left: "12%", size: 7, opacity: 0.8 },
  { top: "82%", left: "33%", size: 11, opacity: 0.5 },
  { top: "88%", left: "58%", size: 8, opacity: 0.9 },
  { top: "92%", left: "80%", size: 9, opacity: 0.7 },
  { top: "95%", left: "40%", size: 7, opacity: 0.6 },
  { top: "90%", left: "95%", size: 10, opacity: 0.8 },
  { top: "10%", left: "92%", size: 8, opacity: 0.5 },
  { top: "40%", left: "52%", size: 6, opacity: 0.7 },
  { top: "60%", left: "30%", size: 9, opacity: 0.6 },
];

const StarBackground: React.FC = () => (
  <>
    {stars.map((s, i) => (
      <span
        key={i}
        style={{
          position: "absolute",
          top: s.top,
          left: s.left,
          width: s.size,
          height: s.size,
          backgroundColor: `rgba(255, 255, 255, ${s.opacity})`,
          clipPath:
            "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
          pointerEvents: "none",
        }}
      />
    ))}
  </>
);

export default StarBackground;
