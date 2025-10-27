import NavbarContent from './NavbarContent';

const Navbar = () => {
  return (
    <div className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
      <NavbarContent />
    </div>
  );
};

export default Navbar;