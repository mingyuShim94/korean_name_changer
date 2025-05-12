import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-gray-100 py-4">
      <div className="container mx-auto px-4">
        <Link href="/">
          <h1 className="text-2xl font-bold cursor-pointer">
            Korean Name Changer
          </h1>
        </Link>
      </div>
    </header>
  );
}
