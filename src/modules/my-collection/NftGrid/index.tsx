"use client";
import { NftItem as NftItemType } from "@/lib/collection-mock";
import NftItem from "../NftItem";

type Props = {
  items: NftItemType[];
};

export default function NftGrid({ items }: Props) {
  return (
    <div
      className="
      grid gap-3 sm:gap-4
      grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5
    "
    >
      {items.map((it) => (
        <NftItem key={it.id} item={it} />
      ))}
    </div>
  );
}
