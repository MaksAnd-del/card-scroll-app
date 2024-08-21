import styles from "./page.module.css";
import { ICard, getCards } from "../sanity/lib/sanity";
import { CardScroller } from "@/components/CardScroller/CardScroller";
import { SectionHeader } from "@/components/SectionHeader/SectionHeader";

export const revalidate = 10;

export default async function HomePage() {
  const cards: ICard[] = await getCards();

  return (
    <div className={styles.wrapper}>
      <SectionHeader />
      <CardScroller cards={cards} />
    </div>
  );
}
