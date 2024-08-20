import styles from "./page.module.css";
import { ICard, getCards } from "../sanity/lib/sanity";
import { Card } from "@/components/Card/Card";
import { CardScroller } from "@/components/CardScroller/CardScroller";

export const revalidate = 10;

export default async function HomePage() {
  const cards: ICard[] = await getCards();

  return (
    <div className={styles.wrapper}>
      {/* <div className={styles.container}>
        {cards.map((card, index) => (
          <Card key={index} card={card} />
        ))}
      </div> */}
      <CardScroller cards={cards} />
    </div>
  );
}
