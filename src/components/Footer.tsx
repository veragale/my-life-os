import { Calendar, Globe } from "lucide-react";

interface FooterProps {
  birthDate?: string;
  daysOnEarth?: number;
}

export default function Footer({ birthDate, daysOnEarth }: FooterProps) {
  return (
    <footer className="mt-auto py-10 text-center text-xs text-ink-400 dark:text-ink-600 space-y-1.5">
      {birthDate && daysOnEarth && (
        <p>
          <Globe size={11} className="inline-block mr-1 -mt-0.5" />
          Born {birthDate} · Day {daysOnEarth.toLocaleString()}
        </p>
      )}
      <p>
        Built with Next.js + Python ·{" "}
        <Calendar size={10} className="inline-block mr-0.5 -mt-0.5" />
        {new Date().getFullYear()}
      </p>
    </footer>
  );
}
