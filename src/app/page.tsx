import dynamic from 'next/dynamic';

const QuietTubeClient = dynamic(
  () => import('./_components/QuietTubeClient'),
  { ssr: false }
);

export default function Home() {
  return <QuietTubeClient />;
}
