import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { participantAPI, Participant } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FiUsers, FiCheckCircle, FiXCircle, FiUserPlus, FiUpload } from 'react-icons/fi';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    attended: 0,
    notAttended: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response: any = await participantAPI.getAll();
      const participants: Participant[] = response.data.participants;

      setStats({
        total: participants.length,
        attended: participants.filter((p) => p.attended).length,
        notAttended: participants.filter((p) => !p.attended).length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Participants',
      value: stats.total,
      icon: FiUsers,
      color: 'from-primary to-secondary',
    },
    {
      title: 'Attended',
      value: stats.attended,
      icon: FiCheckCircle,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Not Attended',
      value: stats.notAttended,
      icon: FiXCircle,
      color: 'from-orange-500 to-red-500',
    },
  ];

  const quickActions = [
    {
      title: 'Add Participant',
      description: 'Register a new participant',
      icon: FiUserPlus,
      path: '/add-participant',
      color: 'bg-gradient-to-br from-primary to-secondary',
    },
    {
      title: 'View All Participants',
      description: 'Manage participant list',
      icon: FiUsers,
      path: '/participants',
      color: 'bg-gradient-to-br from-purple-500 to-pink-500',
    },
    {
      title: 'Upload Ticket Design',
      description: 'Upload pre-designed ticket templates',
      icon: FiUpload,
      path: '/upload-ticket',
      color: 'bg-gradient-to-br from-green-500 to-teal-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">Welcome to Ciphernox 2025 Ticket System</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="overflow-hidden">
              <CardHeader className={`bg-gradient-to-r ${stat.color} text-white`}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{stat.title}</CardTitle>
                  <Icon size={24} />
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-4xl font-bold">
                  {isLoading ? '...' : stat.value}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.title} to={action.path}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}>
                      <Icon size={24} />
                    </div>
                    <CardTitle>{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
