import { currentUser } from "@/app/data/currentUser";
import { redirect } from "next/navigation";

export default async function ProfileRequiredLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await currentUser();

  if (
    !user.userdetails ||
    !user.userdetails.displayname ||
    user.userdetails.displayname === "" ||
    !user.userdetails.handle ||
    user.userdetails.handle === ""
  ) {
    redirect("/profile");
  }

  return <>{children}</>;
}
