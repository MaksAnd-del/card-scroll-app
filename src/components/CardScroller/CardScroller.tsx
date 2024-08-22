"use client";

import { useEffect, useRef, useState } from "react";
import { ICard } from "@/sanity/lib/sanity";
import { motion } from "framer-motion";
import { Card } from "../Card/Card";
import Image from "next/image";
import styles from "./cardScroller.module.css";

const TABLET_WIDTH = 1024;

export function CardScroller({ cards }: { cards: ICard[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const arrowRef = useRef<HTMLDivElement | null>(null);
  const [hoverPosition, setHoverPosition] = useState<"left" | "right" | null>(
    null,
  );
  const [cursorPosition, setCursorPosition] = useState<{
    x: number;
    y: number;
  } | null>({ x: 0, y: 0 });
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [visibleCards, setVisibleCards] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);
  const [isArrowOverButton, setIsArrowOverButton] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const isLarge = window.innerWidth > TABLET_WIDTH;
      setIsLargeScreen(isLarge);

      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const cardWidth = containerRef.current.scrollWidth / cards.length;
        const visibleCount = Math.floor(containerWidth / cardWidth);
        setVisibleCards(visibleCount);
      }
    };

    window.addEventListener("resize", handleResize);

    handleResize();

    setIsLoaded(true);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [cards]);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const scrollLeft = containerRef.current.scrollLeft;
        const cardWidth = containerRef.current.scrollWidth / cards.length;
        const newIndex = Math.round(scrollLeft / cardWidth);
        setActiveIndex(newIndex);
      }
    };

    const container = containerRef.current;
    container?.addEventListener("scroll", handleScroll);

    return () => {
      container?.removeEventListener("scroll", handleScroll);
    };
  }, [cards]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    setCursorPosition({ x: mouseX, y: mouseY });

    if (mouseX < window.innerWidth / 2) {
      setHoverPosition("left");
    } else {
      setHoverPosition("right");
    }

    const arrowRect = arrowRef.current?.getBoundingClientRect();
    checkIfArrowOverCard(arrowRect);
  };

  const handleMouseLeave = () => {
    setHoverPosition(null);
    setHoveredCardIndex(null);
    setIsArrowOverButton(false);
    setCursorPosition(null);
  };

  const checkIfArrowOverCard = (arrowRect: DOMRect | undefined) => {
    if (!arrowRect || !containerRef.current) return;

    const cardElements = containerRef.current.children;

    for (let i = 0; i < cardElements.length; i++) {
      const cardElement = cardElements[i] as HTMLElement;
      const cardRect = cardElement.getBoundingClientRect();

      const button = cardElement.querySelector("button");
      const buttonRect = button?.getBoundingClientRect();

      if (
        buttonRect &&
        arrowRect.right > buttonRect.left &&
        arrowRect.left < buttonRect.right &&
        arrowRect.bottom > buttonRect.top &&
        arrowRect.top < buttonRect.bottom
      ) {
        setIsArrowOverButton(true);
        return;
      } else if (
        arrowRect.right > cardRect.left &&
        arrowRect.left < cardRect.right &&
        arrowRect.bottom > cardRect.top &&
        arrowRect.top < cardRect.bottom
      ) {
        setHoveredCardIndex(i);
        setIsArrowOverButton(false);
      }
    }

    setHoveredCardIndex(null);
    setIsArrowOverButton(false);
  };

  const scrollCards = (direction: "left" | "right") => {
    if (containerRef.current) {
      const cardWidth = containerRef.current.children[0].clientWidth;

      const currentScrollPosition = containerRef.current.scrollLeft;
      let newScrollPosition = currentScrollPosition;

      if (direction === "left") {
        newScrollPosition = currentScrollPosition - cardWidth;
      } else {
        newScrollPosition = currentScrollPosition + cardWidth;
      }

      setTimeout(() => {
        containerRef.current?.scrollTo({
          left: newScrollPosition,
          behavior: "smooth",
        });
      }, 100);
    }
  };

  const scrollToCard = (index: number) => {
    if (containerRef.current) {
      const cardWidth = containerRef.current.scrollWidth / cards.length;
      const targetScroll = cardWidth * index;
      containerRef.current.scrollTo({
        left: targetScroll,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      <div
        className={styles.containerWrapper}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {hoverPosition &&
          isLargeScreen &&
          !isArrowOverButton &&
          cursorPosition && (
            <motion.div
              ref={arrowRef}
              className={styles.arrow}
              initial={false}
              animate={{
                x: (cursorPosition?.x ?? 0) - 50,
                y: (cursorPosition?.y ?? 0) - 165,
                transition: { type: "spring", stiffness: 100, damping: 20 },
              }}
              onClick={() => scrollCards(hoverPosition)}
            >
              <span className={styles.arrowIcon}>
                {hoverPosition === "left" ? "←" : "→"}
              </span>
            </motion.div>
          )}

        <motion.div
          className={styles.container}
          ref={containerRef}
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", fps: 60 }}
          style={{
            overflowX: "scroll",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            scrollSnapType: "x mandatory",
          }}
        >
          {cards.map((card, index) => (
            <div
              key={index}
              className={`${styles.cardContainer} ${
                hoveredCardIndex === index ? styles.hoveredCard : ""
              }`}
            >
              <Card
                key={index}
                card={card}
                setIsArrowOverButton={setIsArrowOverButton}
              />
            </div>
          ))}
        </motion.div>

        {!isLargeScreen && isLoaded && (
          <div className={styles.indicatorContainer}>
            {cards.slice(0, cards.length - visibleCards + 1).map((_, index) => (
              <div
                key={index}
                className={styles.indicator}
                onClick={() => scrollToCard(index)}
              >
                <Image
                  src={
                    index === activeIndex
                      ? "/icons/active-indicator.svg"
                      : "/icons/not-active-indicator.svg"
                  }
                  alt="indicator"
                  width={index === activeIndex ? 48 : 20}
                  height={14}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
