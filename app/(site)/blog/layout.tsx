export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="max-w-6xl mx-auto w-full px-4 pt-16 pb-8 md:pt-24 md:pb-12">
      {children}
    </section>
  );
}
