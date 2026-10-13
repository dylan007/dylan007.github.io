import { Metadata } from "next";
import { GuitarPractice } from "@/components/guitar/GuitarPractice";

export const metadata: Metadata = {
  title: "Guitar Practice",
  description:
    "Interactive guitar scale and chord visualizer with real-time acoustic pitch detection.",
};

export default function GuitarPage() {
  return (
    <div className="site-shell py-8 sm:py-12">
      <GuitarPractice />
    </div>
  );
}
