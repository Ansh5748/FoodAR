import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Sun, Moon, User, ArrowLeft } from 'lucide-react';

export default function Settings() {
  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = stored ? stored : (prefersDark ? 'dark' : 'light');
    setIsDark(initial === 'dark');
    document.documentElement.classList.toggle('dark', initial === 'dark');
  }, []);

  const toggleTheme = () => {
    const nextIsDark = !isDark;
    setIsDark(nextIsDark);
    const theme = nextIsDark ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', nextIsDark);
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="mr-4 border-border text-foreground hover:bg-accent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-muted-foreground">Manage your app preferences</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Appearance</CardTitle>
            <CardDescription className="text-muted-foreground">Choose light or dark mode</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isDark ? <Moon className="w-5 h-5 text-foreground" /> : <Sun className="w-5 h-5 text-foreground" />}
                <span className="text-foreground font-medium">Dark mode</span>
              </div>
              <Switch checked={isDark} onCheckedChange={toggleTheme} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Account</CardTitle>
            <CardDescription className="text-muted-foreground">Manage your profile and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-foreground" />
                <div>
                  <p className="text-foreground font-medium">My Profile</p>
                  <p className="text-muted-foreground text-sm">View and update your details</p>
                </div>
              </div>
              <Link to="/profile">
                <Button variant="outline" className="border-border text-foreground hover:bg-accent">Open</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


