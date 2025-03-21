import { Sidebar } from "@/components/sidebar";
import { MobileHeader } from "@/components/mobile-header";

const MainLayout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="h-full">
      <MobileHeader />
      <div className="flex h-full">
        <Sidebar className="hidden lg:flex h-full w-[256px] flex-col fixed inset-y-0 z-50" />
        <main className="flex-1 h-full lg:pl-[256px] pt-[50px] lg:pt-0">
          <div className="max-w-[1056px] mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
