import { client } from "./client";

export interface ICard {
  title: string;
  description: string;
  imageUrl: string;
}

export async function getCards(): Promise<ICard[]> {
  const query = `*[_type == "card"]{
    title,
    description,
    "imageUrl": image.asset->url
  }`;
  return await client.fetch(query);
}
