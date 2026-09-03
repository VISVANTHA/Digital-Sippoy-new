import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getItems } from "@/lib/db";
import ItemsForm from "./items-form";
import SignOutButton from "./sign-out-button";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const items = await getItems();

  return (
    <main className="page">
      <div className="page-header">
        <h1>Digital-Sippoy Items</h1>
        <SignOutButton />
      </div>
      <p className="subtitle">
        A minimal CRUD fixture: Next.js App Router API route + JSON file store.
      </p>

      <ItemsForm />

      <ul className="items-list">
        {items.map((item) => (
          <li key={item.id}>
            <span className="item-name">{item.name}</span>
            <span className="item-date">
              {new Date(item.createdAt).toLocaleString()}
            </span>
          </li>
        ))}
        {items.length === 0 && <li className="empty">No items yet.</li>}
      </ul>
    </main>
  );
}
