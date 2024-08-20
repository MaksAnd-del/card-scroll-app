"use client";

import { useRef, useState } from "react";
import { ICard } from "@/sanity/lib/sanity";
import { motion } from "framer-motion";
import { Card } from "../Card/Card";
import styles from "./cardScroller.module.css";

export function CardScroller({ cards }: { cards: ICard[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startX, setStartX] = useState<number>(0);
  const [scrollLeft, setScrollLeft] = useState<number>(0);

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      setIsDragging(true);
      setStartX(e.pageX - containerRef.current.offsetLeft);
      setScrollLeft(containerRef.current.scrollLeft);
    }
  };

  const onMouseLeave = () => {
    setIsDragging(false);
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <motion.div
      className={styles.container}
      onMouseDown={onMouseDown}
      onMouseLeave={onMouseLeave}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.1 }}
    >
      <motion.div
        className={styles.container}
        ref={containerRef}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        whileTap={{ cursor: "grabbing" }}
        initial={{ x: 0 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {cards.map((card, index) => (
          <Card key={index} card={card} />
        ))}
      </motion.div>
    </motion.div>
  );
}
