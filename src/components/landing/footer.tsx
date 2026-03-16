const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 px-6 border-t bg-card/50">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold">DocxIQ</span>
          <span className="text-muted-foreground">|</span>
          <span className="text-sm text-muted-foreground">Powered by GeoSoft Inc.</span>
        </div>
        <p className="text-sm text-muted-foreground">
          © {currentYear} GeoSoft Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;