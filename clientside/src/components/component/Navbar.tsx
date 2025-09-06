import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from "../../assets/logo.png";
import { useAuth } from "@/utils/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  console.log("ther user is: ",user);

  

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <nav className="w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo */}
          <Link to="/">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Logo" className="h-10 w-auto" />
              <h1 className="text-xl font-bold text-gray-900">MoneyManager</h1>
            </div>
          </Link>

          {/* Center: Menu */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <NavigationMenu>
              <NavigationMenuList className="flex gap-6">
                <NavigationMenuItem>
                  <NavigationMenuLink
                    onClick={() => navigate("/dashboard")}
                    className="px-4 py-2 text-gray-700 font-medium cursor-pointer"
                  >
                    Dashboard
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    onClick={() => navigate("/about")}
                    className="px-4 py-2 text-gray-700 font-medium cursor-pointer"
                  >
                    About
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    onClick={() => navigate("/services")}
                    className="px-4 py-2 text-gray-700 font-medium cursor-pointer"
                  >
                    Services
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right: Auth */}
          <div>
            {!user ? (
              <Link to="/login">
                <Button
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
                  size="lg"
                >
                  Login
                </Button>
              </Link>
            ) : (
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Avatar className="cursor-pointer">
      <AvatarImage src={user?.profileImage || ""} alt={user?.username} />
      <AvatarFallback>
        {user?.username?.[0]?.toUpperCase() || "U"}
      </AvatarFallback>
    </Avatar>
  </DropdownMenuTrigger>
  <DropdownMenuContent className="w-48">
    <DropdownMenuLabel>{user?.username}</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={() => navigate("/profile")}>
      Profile
    </DropdownMenuItem>
    <DropdownMenuItem onClick={handleLogout}>
      Logout
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>

            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
