import { client } from './client';

export interface Card {
  title: string;
  description: string;
  imageUrl: string;
}

export async function getCards(): Promise<Card[]> {
  const query = `*[_type == "card"]{
    title,
    description,
    "imageUrl": image.asset->url
  }`;
  console.log("Fetching data from Sanity...");
  return await client.fetch(query);
}