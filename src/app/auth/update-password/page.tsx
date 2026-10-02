import type { Metadata } from "next";

import { UpdatePasswordScreen } from "@/components/UpdatePasswordScreen";

export const metadata: Metadata = {
  title: "Update password",
  robots: {
    index: false,
    follow: false,
  },
};

export default function UpdatePasswordPage() {
  return <UpdatePasswordScreen />;
}
