export default function Footer() {
  return (
    <footer className="py-8 bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16">
        <div className="text-center">
          <p className="text-xs text-[var(--text-tertiary)]">
            &copy; {new Date().getFullYear()} Divyanshu Goyal
          </p>
        </div>
      </div>
    </footer>
  );
}
