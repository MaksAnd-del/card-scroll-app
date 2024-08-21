"use client";

import { motion } from "framer-motion";
import styles from "./sectionHeader.module.css";

export function SectionHeader() {
  return (
    <motion.h1
      className={styles.title}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.4 }}
    >
      <span className={styles.bold}>Discover</span> grand venues
    </motion.h1>
  );
}
