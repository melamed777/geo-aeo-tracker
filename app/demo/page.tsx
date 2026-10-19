import { SovereignDashboard } from "@/components/sovereign-dashboard";

export const metadata = {
  title: "מעקב נראות ב-AI — הדגמה",
  description: "הדגמה לקריאה בלבד של כלי מעקב הנראות ב-AI. חקור מעקב נראות, כרטיסי מתחרים, ניתוח אזכורים ועוד.",
};

export default function DemoPage() {
  return <SovereignDashboard demoMode />;
}
