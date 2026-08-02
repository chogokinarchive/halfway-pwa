import type { Metadata } from "next";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedCards } from "@/components/home/FeaturedCards";
import { QuickActions } from "@/components/home/QuickActions";
import { LatestActivities } from "@/components/home/LatestActivities";

export const metadata: Metadata = {
  title: "Halfway — Home",
};

export default function HomePage() {
  return (
    <div className="space-y-8">
      <HeroSection />
      <FeaturedCards />
      <QuickActions />
      <LatestActivities />
    </div>
  );
}
