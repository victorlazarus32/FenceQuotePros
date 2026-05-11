import { isLoggedIn } from "@/lib/session";
import Dashboard from "./Dashboard";
import LandingPage from "./landing/page";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string | string[] }>;
}) {
  if (await isLoggedIn()) {
    return <Dashboard />;
  }
  return <LandingPage searchParams={searchParams} />;
}
