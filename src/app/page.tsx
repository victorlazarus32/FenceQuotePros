import { isLoggedIn } from "@/lib/session";
import Dashboard from "./Dashboard";
import LandingPage from "./landing/page";

export default async function HomePage() {
  if (await isLoggedIn()) {
    return <Dashboard />;
  }
  return <LandingPage />;
}
