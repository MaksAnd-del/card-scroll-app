"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ICard } from "@/sanity/lib/sanity";
import { motion } from "framer-motion";
import { Card } from "../Card/Card";
import Image from "next/image";
import styles from "./cardScroller.module.css";

function debounce(fn: Function, delay: number) {
  let timer: NodeJS.Timeout;
  return function (...args: any) {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

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
  } | null>(null);
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

  const handleMouseMove = useCallback(
    debounce((e: React.MouseEvent<HTMLDivElement>) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      const newHoverPosition =
        mouseX < window.innerWidth / 2 ? "left" : "right";

      if (hoverPosition !== newHoverPosition) {
        setHoverPosition(newHoverPosition);
      }

      if (cursorPosition?.x !== mouseX || cursorPosition?.y !== mouseY) {
        setCursorPosition({ x: mouseX, y: mouseY });
      }

      const arrowRect = arrowRef.current?.getBoundingClientRect();
      checkIfArrowOverCard(arrowRect);
    }, 50),
    [hoverPosition, cursorPosition],
  );

  const handleMouseLeave = useCallback(() => {
    setHoverPosition(null);
    setHoveredCardIndex(null);
    setIsArrowOverButton(false);
    setCursorPosition(null);
  }, []);

  const checkIfArrowOverCard = useCallback(
    (arrowRect: DOMRect | undefined) => {
      if (!arrowRect || !containerRef.current) return;

      const cardElements = containerRef.current.children;
      let isOverButton = false;
      let foundHoveredCardIndex = null;

      for (let i = 0; i < cardElements.length; i++) {
        const cardElement = cardElements[i] as HTMLElement;
        const cardRect = cardElement.getBoundingClientRect();

        const button = cardElement.querySelector("button");
        if (button) {
          const buttonRect = button.getBoundingClientRect();

          if (
            arrowRect.right > buttonRect.left &&
            arrowRect.left < buttonRect.right &&
            arrowRect.bottom > buttonRect.top &&
            arrowRect.top < buttonRect.bottom
          ) {
            isOverButton = true;
          }
        }

        if (
          arrowRect.right > cardRect.left &&
          arrowRect.left < cardRect.right &&
          arrowRect.bottom > cardRect.top &&
          arrowRect.top < cardRect.bottom
        ) {
          foundHoveredCardIndex = i;
        }
      }

      if (isOverButton !== isArrowOverButton) {
        setIsArrowOverButton(isOverButton);
      }

      if (foundHoveredCardIndex !== hoveredCardIndex) {
        setHoveredCardIndex(foundHoveredCardIndex);
      }
    },
    [hoveredCardIndex, isArrowOverButton],
  );

  const scrollCards = useCallback((direction: "left" | "right") => {
    if (containerRef.current) {
      const cardWidth = containerRef.current.children[0].clientWidth;

      const currentScrollPosition = containerRef.current.scrollLeft;
      let newScrollPosition = currentScrollPosition;

      if (direction === "left") {
        newScrollPosition = currentScrollPosition - cardWidth;
      } else {
        newScrollPosition = currentScrollPosition + cardWidth;
      }

      const startTime = performance.now();

      function animateScroll(timestamp: number) {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / 300, 1);

        containerRef.current?.scrollTo({
          left:
            currentScrollPosition +
            progress * (newScrollPosition - currentScrollPosition),
        });

        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        }
      }

      requestAnimationFrame(animateScroll);
    }
  }, []);

  const scrollToCard = useCallback(
    (index: number) => {
      if (containerRef.current) {
        const cardWidth = containerRef.current.scrollWidth / cards.length;
        const targetScroll = cardWidth * index;
        containerRef.current.scrollTo({
          left: targetScroll,
          behavior: "smooth",
        });
      }
    },
    [cards.length],
  );

  return (
    <>
      <div
        className={styles.containerWrapper}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {hoverPosition && isLargeScreen && !isArrowOverButton && (
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
                handleMouseLeave={handleMouseLeave}
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
