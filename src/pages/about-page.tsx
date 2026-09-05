import { AboutContent } from "@/components/about-content";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold">このツールについて</h1>
      <AboutContent />
    </div>
  );
}
