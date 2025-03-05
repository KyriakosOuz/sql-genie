
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Database, LogIn, LogOut, UserPlus, Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const NavBar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-8">
          <Link to="/" className="flex items-center space-x-2">
            <Database className="h-6 w-6" />
            <span className="font-bold">SQL Generator</span>
          </Link>
          
          <div className="hidden md:flex gap-6">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === '/' ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              Home
            </Link>
            {user && (
              <Link 
                to="/dashboard" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === '/dashboard' ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                Dashboard
              </Link>
            )}
          </div>
        </div>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {user.email}
              </span>
              <Button 
                variant="ghost" 
                onClick={() => signOut()}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link to="/login">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Link>
              </Button>
              <Button asChild>
                <Link to="/signup">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign Up
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Navigation</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/">Home</Link>
              </DropdownMenuItem>
              
              {user ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/login">
                      <LogIn className="h-4 w-4 mr-2" />
                      Login
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/signup">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Sign Up
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
