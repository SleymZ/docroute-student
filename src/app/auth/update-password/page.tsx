import type { Metadata } from "next";

import { UpdatePasswordScreen } from "@/components/UpdatePasswordScreen";

export const metadata: Metadata = {
  title: "Update password | DocRoute Student",
};

export default function UpdatePasswordPage() {
  return <UpdatePasswordScreen />;
}