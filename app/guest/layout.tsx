import { GuestBottomNav } from '../components/guest/GuestBottomNav';

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {children}
      <GuestBottomNav />
    </div>
  );
}
