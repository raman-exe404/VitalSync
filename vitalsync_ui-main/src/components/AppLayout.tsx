import AppSidebar from "./AppSidebar";
import Navbar from "./Navbar";
import ClayBlobs from "./ClayBlobs";

const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-screen w-full bg-background relative overflow-hidden">
    <ClayBlobs />
    <AppSidebar />
    <div className="flex-1 flex flex-col min-h-screen relative z-10 min-w-0">
      <Navbar />
      <main className="flex-1 p-4 md:p-6 lg:p-8 pl-4 md:pl-6">{children}</main>
    </div>
  </div>
);

export default AppLayout;
