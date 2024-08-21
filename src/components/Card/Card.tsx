import { ICard } from "@/sanity/lib/sanity";
import styles from "./card.module.css";
import Image from "next/image";

interface ICardProps {
  card: ICard;
}

export const Card = ({ card }: ICardProps) => {
  const { title, description, imageUrl } = card;
  return (
    <div
      className={styles.cardWrapper}
      style={{ backgroundImage: `url(${imageUrl})` }}
    >
      <div className={styles.cardDescriptionBlock}>
        <h2 className={styles.cardTitle}>{title}</h2>
        <p className={styles.cardDescription}>{description}</p>
        <div className={styles.buttonBlock}>
          <button className={styles.cardButton}>Discover</button>
          <Image
            src="/icons/icon-right.svg"
            alt="arrow-icon"
            width={20}
            height={20}
          />
        </div>
      </div>
    </div>
  );
};
