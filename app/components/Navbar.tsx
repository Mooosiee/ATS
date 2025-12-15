import { Link } from "react-router";
export const Navbar = () => {
  return (
    
          <nav className="navbar">
              <Link to="/">
                <p className="text-2xl font-bold text-gradient">RESUMIND</p>
              </Link>
              <Link to="/upload"><button className="primary-button">Upload Resume</button></Link>
        </nav>
   
  )
}
