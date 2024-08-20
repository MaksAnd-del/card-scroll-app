import Image from "next/image";
import styles from "./page.module.css";
import { Card, getCards } from "../sanity/lib/sanity";

export const revalidate = 10;

export default async function HomePage() {
  const cards: Card[] = await getCards();

  console.log('cards', cards);
  console.log('Test component');
  
  return (
    <div>
      <h1>Card Scroll App</h1>
      {cards.map((post, index) => (
        <div key={index}>
          <h2>{post.title}</h2>
          <p>{post.description}</p>
          {post.imageUrl && <Image src={post.imageUrl} alt={post.title} width={200} height={500} />}
        </div>
      ))}
    </div>
  );
}
