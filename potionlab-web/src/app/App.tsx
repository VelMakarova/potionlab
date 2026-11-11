import { LaboratoryPage } from '../features/laboratory/LaboratoryPage';
import { LaboratoryProvider } from '../features/laboratory/LaboratoryProvider';
import { UnsupportedViewportScreen } from '../shared/components/UnsupportedViewportScreen';
import { useDesktopViewport } from '../shared/hooks/useDesktopViewport';

export default function App() {
  const { desktop, started } = useDesktopViewport();

  return (
    <>
      <div className="wooden pl-theme" hidden={!desktop}>
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
