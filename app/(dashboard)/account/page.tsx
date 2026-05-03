import { AccountCard } from "@/components/account-card"

export const metadata = {
  title: "GitHub Account · DevAssist",
  description: "Securely fetch the authenticated GitHub user via /api/github-user.",
}

export default function AccountPage() {
  return <AccountCard />
}
