import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-gray-100 py-3 md:py-4">
      <div className="container mx-auto px-4">
        <h1 className="text-xl md:text-2xl font-bold">
          <Link href="/" className="cursor-pointer">
            My Korean Name
          </Link>
        </h1>
      </div>
    </header>
  );
}
