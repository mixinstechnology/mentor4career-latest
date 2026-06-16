import { useLoader } from '../context/LoaderContext';

export default function Loader() {
  const { isLoading } = useLoader();
  if (!isLoading) return null;

  return (
    <>
      <style>{`@keyframes m4c-spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        background: 'rgba(0,0,0,0.18)', pointerEvents: 'all',
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          border: '4px solid rgba(79,70,229,0.18)',
          borderTopColor: '#4F46E5',
          animation: 'm4c-spin 0.7s linear infinite',
        }} />
      </div>
    </>
  );
}
