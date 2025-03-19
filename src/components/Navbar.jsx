const Navbar = () => {
    return (
      <nav className="flex justify-between items-center p-6 bg-gray-800 text-white shadow-lg hover:bg-gray-700 transition duration-300">
        <div className="text-3xl font-bold">LLM CODE AUDIT</div>
        <div className="flex gap-8">
          <a href="#" className="text-white hover:text-blue-400 transition duration-300">Sign Up</a>
          <a href="#" className="text-white hover:text-blue-400 transition duration-300">Login</a>
          <a href="#" className="text-white hover:text-blue-400 transition duration-300">About Us</a>
        </div>
      </nav>
    );
  };
  
  export default Navbar;