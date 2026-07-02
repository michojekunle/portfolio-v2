import { redirect } from "next/navigation";

export default function LogIndexPage(): never {
  const today = new Date().toLocaleDateString("en-CA");
  redirect(`/tools/journal/log/${today}`);
}
