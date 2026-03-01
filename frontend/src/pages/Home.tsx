import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Bell, Shield, Home } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-12 animate-fade-in">
      {/* Hero */}
      <div className="text-center py-8">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-card-hover">
            <img
              src="/assets/generated/house-logo.dim_128x128.png"
              alt="Casa Rental"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4 leading-tight">
          Welcome to<br />
          <span className="text-primary">Casa Rental</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
          A simple, friendly way to manage your rental guests, track bills, and send payment reminders.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link to="/owner">
            <Button size="lg" className="gap-2 font-bold w-full sm:w-auto">
              <Users className="w-5 h-5" />
              Owner Dashboard
            </Button>
          </Link>
          <Link to="/guest">
            <Button size="lg" variant="outline" className="gap-2 font-bold w-full sm:w-auto">
              <Bell className="w-5 h-5" />
              Check My Bill
            </Button>
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: Users,
            title: 'Guest Management',
            desc: 'Add, edit, and remove guest profiles with all their details in one place.',
            color: 'bg-primary/10 text-primary',
          },
          {
            icon: Bell,
            title: 'Bill Notifications',
            desc: 'Automatic in-app notifications when bills are due. Clear them once paid.',
            color: 'bg-warning/20 text-warning-foreground',
          },
          {
            icon: Shield,
            title: 'Owner Control',
            desc: 'Only the owner can mark bills as paid and clear notifications.',
            color: 'bg-success/15 text-success',
          },
        ].map(({ icon: Icon, title, desc, color }) => (
          <Card key={title} className="shadow-card border-border hover:shadow-card-hover transition-shadow">
            <CardContent className="p-5 text-center">
              <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mx-auto mb-3`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Start */}
      <Card className="shadow-card border-primary/20 bg-primary/5">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
            <Home className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-display font-bold text-foreground">Getting Started</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Go to the Owner Dashboard to add your first guest. Guests can check their bill status using their Guest ID.
            </p>
          </div>
          <Link to="/owner">
            <Button variant="outline" size="sm" className="font-semibold flex-shrink-0">
              Get Started →
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
