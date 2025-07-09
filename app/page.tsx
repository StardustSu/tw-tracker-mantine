import { ColorSchemeToggle } from "@/components/ColorSchemeToggle/ColorSchemeToggle";
import UsersTable from "@/components/UsersTable/UsersTable";

export default function HomePage() {
  return (
    <>
      <ColorSchemeToggle />
      <UsersTable />
    </>
  );
}
