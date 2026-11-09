import { LaboratoryPage } from "../features/laboratory/LaboratoryPage";
import { LaboratoryProvider } from "../features/laboratory/LaboratoryProvider";
import { UnsupportedViewportScreen } from "../shared/components/UnsupportedViewportScreen";
import { useDesktopViewport } from "../shared/hooks/useDesktopViewport";
import "./App.css";

export default function App() {
  const { desktop, started } = useDesktopViewport();

  return (
    <>
      <div hidden={!desktop}>
        {started && (
          <LaboratoryProvider>
            <LaboratoryPage />
          </LaboratoryProvider>
        )}
      </div>

      {!desktop && <UnsupportedViewportScreen />}
    </>
  );
}
