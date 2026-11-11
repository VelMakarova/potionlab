import { LaboratoryPage } from '../features/laboratory/LaboratoryPage';
import { LaboratoryProvider } from '../features/laboratory/LaboratoryProvider';
import { useDesktopViewport } from '../shared/hooks/useDesktopViewport';

export default function App() {
  const { desktop, started } = useDesktopViewport();

  return (
    <div className="laboratory-theme pl-dark-wood">
      <LaboratoryProvider started={started}>
        <LaboratoryPage desktop={desktop} />
      </LaboratoryProvider>
    </div>
  );
}
