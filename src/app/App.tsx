import { HomeStateProvider } from "@/state/homeStore";
import { HomePage } from "@/pages/HomePage";

export function App() {
  return (
    <HomeStateProvider>
      <HomePage />
    </HomeStateProvider>
  );
}
