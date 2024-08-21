"use client";

import { useEffect, useRef, useState } from "react";
import { ICard } from "@/sanity/lib/sanity";
import { motion } from "framer-motion";
import { Card } from "../Card/Card";
import Image from "next/image";
import styles from "./cardScroller.module.css";

const TABLET_WIDTH = 834;

export function CardScroller({ cards }: { cards: ICard[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const arrowRef = useRef<HTMLDivElement | null>(null);
  const [constraints, setConstraints] = useState({ left: 0, right: 0 });
  const [hoverPosition, setHoverPosition] = useState<"left" | "right" | null>(
    null,
  );
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [visibleCards, setVisibleCards] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);

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
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const scrollWidth = containerRef.current.scrollWidth;
      setConstraints({
        left: -(scrollWidth - containerWidth),
        right: 0,
      });
    }
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

  useEffect(() => {}, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const arrowRect = arrowRef.current?.getBoundingClientRect();
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    setCursorPosition({ x: mouseX, y: mouseY });

    if (mouseX < window.innerWidth / 2) {
      setHoverPosition("left");
    } else {
      setHoverPosition("right");
    }

    if (
      (arrowRect && arrowRect?.top < 100) ||
      (arrowRect && arrowRect.top > 800)
    ) {
      setCursorPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseLeave = () => {
    setHoverPosition(null);
  };

  const scrollCards = (direction: "left" | "right") => {
    if (containerRef.current) {
      const scrollAmount = containerRef.current.offsetWidth / 2;
      const currentScroll = containerRef.current.scrollLeft;

      if (direction === "left") {
        containerRef.current.scrollTo({
          left: currentScroll - scrollAmount,
          behavior: "smooth",
        });
      } else {
        containerRef.current.scrollTo({
          left: currentScroll + scrollAmount,
          behavior: "smooth",
        });
      }
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
        {hoverPosition && isLargeScreen && (
          <motion.div
            ref={arrowRef}
            className={`${styles.arrow} ${
              hoverPosition === "left" ? styles.leftArrow : styles.rightArrow
            }`}
            style={{
              top: cursorPosition.y,
              left: cursorPosition.x,
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
          transition={{ duration: 0.8, ease: "easeOut" }}
          drag={isLargeScreen ? "x" : false}
          dragConstraints={constraints}
          style={{
            overflowX: "scroll",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            scrollSnapType: "x mandatory",
          }}
        >
          {cards.map((card, index) => (
            <Card key={index} card={card} />
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
                      : "/icons/indicator.svg"
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
