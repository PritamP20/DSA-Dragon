"use client"
import Image from "next/image";
import Game from "@/components/Game";

export default function Home() {
  return (
    <div className="bg-black w-screen h-screen flex justify-center items-center">
      <Game></Game>
    </div>
  );
}
