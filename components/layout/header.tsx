import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="bg-gray-100 py-3 md:py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold">
          <Link href="/" className="cursor-pointer flex items-center">
            <Image
              src="/favicon.ico"
              alt="Korean Name Logo"
              width={32}
              height={32}
              className="mr-2"
            />
            Name To Korean
          </Link>
        </h1>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link
                href="/pricing"
                className="text-sm md:text-base hover:underline"
              >
                Pricing
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="text-sm md:text-base hover:underline"
              >
                Terms & Policies
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
