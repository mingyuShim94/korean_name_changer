import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="bg-gray-100 py-3 md:py-4">
      <div className="container mx-auto px-4">
        <h1 className="text-xl md:text-2xl font-bold">
          <Link href="/" className="cursor-pointer flex items-center">
            <Image
              src="/favicon.ico"
              alt="Korean Name Logo"
              width={32}
              height={32}
              className="mr-2"
            />
            My Korean Name
          </Link>
        </h1>
      </div>
    </header>
  );
}
