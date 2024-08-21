import styles from "./page.module.css";
import { ICard, getCards } from "../sanity/lib/sanity";
import { Card } from "@/components/Card/Card";
import { CardScroller } from "@/components/CardScroller/CardScroller";

export const revalidate = 10;

export default async function HomePage() {
  const cards: ICard[] = await getCards();

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>
        <span className={styles.bold}>Discover</span> grand venues
      </h1>
      <CardScroller cards={cards} />
    </div>
  );
}
