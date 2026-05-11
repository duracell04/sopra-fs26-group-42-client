"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Typography } from "antd";
import StarBackground from "@/components/StarBackground";
import { useRequireAuth } from "@/hooks/useAuthGuard";

const { Title, Text } = Typography;

type TutorialSlide = {
  title: string;
  description: string;
  image: string;
  alt: string;
};

const tutorialSlides: TutorialSlide[] = [
  {
    title: "Move and shoot",
    description: "Move with A and D. Press Space to shoot incoming number blocks.",
    image: "/images/how-to-play-1.png",
    alt: "Tutorial slide showing movement and shooting controls",
  },
  {
    title: "Match the product",
    description: "The target product is shown at the top. You and your partner must each hit one factor so the two numbers multiply to that product.",
    image: "/images/how-to-play-2.png",
    alt: "Tutorial slide showing the target product and factor blocks",
  },
  {
    title: "Protect your shared lives",
    description: "If either player shoots the wrong block, the team loses one shared life.",
    image: "/images/how-to-play-3.png",
    alt: "Tutorial slide showing life loss after hitting a wrong block",
  },
  {
    title: "Keep going",
    description: "Work together, react quickly, and see how far you can get!",
    image: "/images/how-to-play-4.png",
    alt: "Tutorial slide encouraging the player to keep playing",
  },
];

export default function HowToPlayPage() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  useRequireAuth();

  const slide = tutorialSlides[currentSlide];
  const isFirstSlide = currentSlide === 0;
  const isLastSlide = currentSlide === tutorialSlides.length - 1;

  return (
    <div className="tutorial-container">
      <StarBackground />

      <div className="tutorial-card">
        <button
          type="button"
          className="tutorial-close-btn"
          aria-label="Close how to play"
          onClick={() => router.push("/menu")}
        >
          X
        </button>

        <div className="tutorial-header">
          <Text className="tutorial-kicker">How to Play</Text>
          <Title level={2} className="tutorial-title">
            {slide.title}
          </Title>
          <Text className="tutorial-progress">
            Slide {currentSlide + 1} of {tutorialSlides.length}
          </Text>
        </div>

        <div className="tutorial-image-frame">
          <img src={slide.image} alt={slide.alt} className="tutorial-image" />
        </div>

        <p className="tutorial-description">{slide.description}</p>

        <div className="tutorial-dots">
          {tutorialSlides.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              className={`tutorial-dot ${index === currentSlide ? "tutorial-dot--active" : ""}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>

        <div className="tutorial-actions">
          <Button
            type="default"
            variant="solid"
            className="tutorial-nav-button"
            disabled={isFirstSlide}
            onClick={() => setCurrentSlide((prev) => prev - 1)}
          >
            Previous
          </Button>

          {isLastSlide ? (
            <Button
              type="primary"
              variant="solid"
              className="tutorial-nav-button"
              onClick={() => router.push("/menu")}
            >
              Back to Menu
            </Button>
          ) : (
            <Button
              type="primary"
              variant="solid"
              className="tutorial-nav-button"
              onClick={() => setCurrentSlide((prev) => prev + 1)}
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
