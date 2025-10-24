import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { participantAPI, Participant } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  FiArrowLeft,
  FiTrash2,
  FiMail,
  FiGrid,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
} from 'react-icons/fi';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const Participants = () => {
  const navigate = useNavigate();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [qrModalData, setQrModalData] = useState<Participant | null>(null);
  const location = useLocation();

  useEffect(() => {
    fetchParticipants();
  }, []);

  // Refresh when navigated from QR Scanner with refresh state
  useEffect(() => {
    if (location.state?.refresh) {
      fetchParticipants();
      // Clear the state so future navigations don't trigger refresh
      navigate('/participants', { replace: true });
    }
  }, [location.state]);

  const fetchParticipants = async () => {
    setIsLoading(true);
    try {
      const response: any = await participantAPI.getAll();
      setParticipants(response.data.participants || []);
    } catch (error) {
      toast.error('Failed to fetch participants');
      setParticipants([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      await participantAPI.delete(deleteId);
      toast.success('Participant deleted successfully');
      fetchParticipants();
    } catch (error) {
      toast.error('Failed to delete participant');
    } finally {
      setDeleteId(null);
    }
  };

  const handleSendEmail = async (id: string) => {
    try {
      await participantAPI.sendEmail(id);
      toast.success('Email sent successfully');
      fetchParticipants(); // Refresh the page data after successful email send
    } catch (error) {
      toast.error('Failed to send email');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/dashboard')}
          className="shrink-0"
        >
          <FiArrowLeft size={18} />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Participants
          </h1>
          <p className="text-muted-foreground mt-1">Manage all registered participants</p>
        </div>
        <Button
          onClick={fetchParticipants}
          variant="outline"
          size="icon"
          disabled={isLoading}
          className="shrink-0"
        >
          <FiRefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Participant List</CardTitle>
          <CardDescription>
            Total: {participants.length} participants
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <FiRefreshCw className="animate-spin mx-auto mb-2" size={32} />
              <p className="text-muted-foreground">Loading participants...</p>
            </div>
          ) : participants.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No participants found</p>
              <Button
                onClick={() => navigate('/add-participant')}
                className="mt-4 bg-gradient-to-r from-primary to-secondary"
              >
                Add First Participant
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Index No.</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>Email Sent</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants.map((participant) => (
                    <TableRow key={participant.id}>
                      <TableCell className="font-medium">{participant.name}</TableCell>
                      <TableCell>{participant.email}</TableCell>
                      <TableCell>{participant.mobile}</TableCell>
                      <TableCell>{participant.indexNumber}</TableCell>
                      <TableCell>
                        <Badge
                          variant={participant.attended ? 'default' : 'secondary'}
                          className={participant.attended ? 'bg-green-500' : ''}
                        >
                          {participant.attended ? (
                            <span className="flex items-center gap-1">
                              <FiCheckCircle size={14} /> Attended
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <FiXCircle size={14} /> Not Attended
                            </span>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={participant.emailSent ? 'default' : 'secondary'}
                          className={participant.emailSent ? 'bg-green-500' : ''}
                        >
                          {participant.emailSent ? (
                            <span className="flex items-center gap-1">
                              <FiCheckCircle size={14} /> Sent
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <FiXCircle size={14} /> Not Sent
                            </span>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setQrModalData(participant)}
                            title="View QR Code"
                          >
                            <FiGrid size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSendEmail(participant.id!)}
                            title="Send Email"
                          >
                            <FiMail size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteId(participant.id!)}
                            title="Delete"
                          >
                            <FiTrash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the participant record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* QR Code Modal */}
      <Dialog open={!!qrModalData} onOpenChange={() => setQrModalData(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>QR Code</DialogTitle>
            <DialogDescription>{qrModalData?.name}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="bg-white p-8 rounded-lg">
              <div className="text-6xl font-mono text-center">{qrModalData?.qrCode}</div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              QR Code: <strong>{qrModalData?.qrCode}</strong>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Participants;
