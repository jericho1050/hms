'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  HospitalIcon,
  Menu,
  X,
  UserCircle,
  LogOut,
  Settings,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/hooks/use-auth';

export function NavBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.push('/auth/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Patients', href: '/patients' },
    { name: 'Appointments', href: '/appointments' },
    { name: 'Staff', href: '/staff' },
    { name: 'Reports', href: '/reports' },
  ];

  return (
    <nav className='bg-background border-b'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='flex h-16 justify-between'>
          <div className='flex'>
            <div className='flex flex-shrink-0 items-center'>
              <Link href='/' className='flex items-center'>
                <HospitalIcon className='h-8 w-8 text-primary' />
                <span className='ml-2 text-xl font-bold'>CareSanar</span>
              </Link>
            </div>

            {/* Desktop navigation */}
            <div className='hidden sm:ml-6 sm:flex sm:space-x-8'>
              {isAuthenticated &&
                navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                      pathname === item.href
                        ? 'border-b-2 border-primary text-foreground'
                        : 'border-transparent text-muted-foreground hover:border-gray-300 hover:text-foreground'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
            </div>
          </div>

          {/* Right side controls */}
          <div className='flex items-center'>
            <ThemeToggle />

            {isLoading ? (
              <div className='ml-4 h-8 w-8 rounded-full bg-muted animate-pulse'></div>
            ) : isAuthenticated ? (
              <div className='flex items-center ml-4'>
                <Button variant='ghost' size='icon' className='mr-2'>
                  <Bell className='h-5 w-5' />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='rounded-full'
                      aria-label='User menu'
                    >
                      <UserCircle className='h-8 w-8' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href='/profile'>
                        <UserCircle className='mr-2 h-4 w-4' />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href='/settings'>
                        <Settings className='mr-2 h-4 w-4' />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      data-testid='logout-button'
                    >
                      <LogOut className='mr-2 h-4 w-4' />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className='flex items-center ml-4'>
                <Button asChild variant='ghost' className='mr-2'>
                  <Link href='/auth/login'>Login</Link>
                </Button>
                <Button asChild>
                  <Link href='/auth/register'>Sign Up</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <div className='flex items-center sm:hidden ml-4'>
              <Button
                variant='ghost'
                size='icon'
                aria-label='Toggle menu'
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className='h-6 w-6' />
                ) : (
                  <Menu className='h-6 w-6' />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className='sm:hidden' data-testid='mobile-menu'>
          <div className='space-y-1 pb-3 pt-2'>
            {isAuthenticated &&
              navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 text-base font-medium ${
                    pathname === item.href
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            {isAuthenticated && (
              <button
                className='block w-full text-left px-3 py-2 text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground'
                onClick={handleLogout}
                data-testid='mobile-logout-button'
              >
                <div className='flex items-center'>
                  <LogOut className='mr-2 h-4 w-4' />
                  Logout
                </div>
              </button>
            )}
            {!isAuthenticated && (
              <>
                <Link
                  href='/auth/login'
                  className='block px-3 py-2 text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground'
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href='/auth/register'
                  className='block px-3 py-2 text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground'
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
