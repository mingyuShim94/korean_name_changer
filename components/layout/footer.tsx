export default function Footer() {
  return (
    <footer className="bg-gray-100 py-4 mt-auto">
      <div className="container mx-auto px-4 text-center text-sm text-gray-600">
        <p>
          &copy; {new Date().getFullYear()} Korean Name Changer. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
