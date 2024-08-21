"use client";

import { useEffect, useRef, useState } from "react";
import { ICard } from "@/sanity/lib/sanity";
import { motion, useAnimation } from "framer-motion";
import { Card } from "../Card/Card";
import styles from "./cardScroller.module.css";

export function CardScroller({ cards }: { cards: ICard[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [constraints, setConstraints] = useState({ left: 0, right: 0 });

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

  return (
    <motion.div className={styles.containerWrapper}>
      <motion.div
        className={styles.container}
        ref={containerRef}
        drag="x"
        dragConstraints={constraints}
        whileTap={{ cursor: "grabbing" }}
        initial={{ x: 0 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {cards.map((card, index) => (
          <Card key={index} card={card} />
        ))}
      </motion.div>
    </motion.div>
  );
}
