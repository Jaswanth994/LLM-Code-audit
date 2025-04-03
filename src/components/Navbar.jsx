import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation(); // Get the current route

  return (
    <nav className="flex justify-between items-center p-6 bg-gray-800 text-white shadow-lg hover:bg-gray-700 transition duration-300">
      <div className="text-4xl font-bold">
        <Link to="/">LLM CODE AUDIT</Link>
      </div>
      <div className="flex gap-8">
        <Link
          to="/"
          className={`text-white hover:text-blue-400 transition duration-300 ${
            location.pathname === "/" ? "text-blue-400" : ""
          }`}
        >
          Home
        </Link>
        <Link
          to="/about"
          className={`text-white hover:text-blue-400 transition duration-300 ${
            location.pathname === "/about" ? "text-blue-400" : ""
          }`}
        >
          About Us
        </Link>
        <Link to="/signup" className="text-white hover:text-blue-400 transition duration-300">
          Sign Up
        </Link>
        <Link to="/login" className="text-white hover:text-blue-400 transition duration-300">
          Login
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;