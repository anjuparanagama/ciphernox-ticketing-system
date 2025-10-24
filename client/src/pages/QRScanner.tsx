import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { participantAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { FiArrowLeft, FiCheckCircle, FiCamera, FiCameraOff } from 'react-icons/fi';
import QrReader from 'react-qr-scanner';
import AttendancePopup from '@/components/AttendancePopup';

const QRScanner = () => {
  const navigate = useNavigate();
  const [qrCode, setQrCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  const [useCamera, setUseCamera] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const handleScan = async (scannedQrCode?: string) => {
    const codeToUse = scannedQrCode || qrCode;
    if (!codeToUse.trim()) {
      toast.error('Please enter a QR code');
      return;
    }

    setIsScanning(true);
    try {
      const response: any = await participantAPI.markAttendance(codeToUse);
      // Set scanned data directly from the response
      const participantData = response.data.participant;
      setScannedData(participantData);
      setQrCode('');
      
      // Navigate back to participants page after showing success message
      setTimeout(() => {
        setScannedData(null);
        navigate('/participants', { state: { refresh: true } });
      }, 2500); // 2.5 seconds to ensure popup has time to animate out
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
      setScannedData(null);
    } finally {
      setIsScanning(false);
    }
  };

  const handleQrScan = (data: string | null) => {
    if (data && !isScanning) {
      handleScan(data);
    }
  };

  const handleQrError = (error: any) => {
    console.error('QR Scanner error:', error);
    setCameraError('Camera access denied or not available. Please use manual input.');
    setUseCamera(false);
  };

  const toggleCamera = () => {
    if (useCamera) {
      setUseCamera(false);
      setCameraError(null);
    } else {
      setUseCamera(true);
      setCameraError(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/dashboard')}
          className="shrink-0"
        >
          <FiArrowLeft size={18} />
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            QR Scanner
          </h1>
          <p className="text-muted-foreground mt-1">Scan participant QR codes for attendance</p>
        </div>
      </div>

      {scannedData && (
        <AttendancePopup
          participant={scannedData}
          onClose={() => setScannedData(null)}
        />
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FiCamera size={24} />
            Scanner
          </CardTitle>
          <CardDescription>Enter or scan the QR code to mark attendance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="qrCode">QR Code</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleCamera}
                className="flex items-center gap-2"
              >
                {useCamera ? <FiCameraOff size={16} /> : <FiCamera size={16} />}
                {useCamera ? 'Manual Input' : 'Use Camera'}
              </Button>
            </div>

            {useCamera ? (
              <div className="space-y-3">
                <div className="relative">
                  <QrReader
                    delay={300}
                    style={{ width: '100%', height: '300px' }}
                    onError={handleQrError}
                    onScan={handleQrScan}
                    facingMode="environment"
                  />
                  {isScanning && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="text-white text-center">
                        <FiCheckCircle size={48} className="mx-auto mb-2" />
                        <p>Processing QR Code...</p>
                      </div>
                    </div>
                  )}
                </div>
                {cameraError && (
                  <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    {cameraError}
                  </p>
                )}
                <p className="text-sm text-muted-foreground text-center">
                  Position the QR code within the camera view to scan automatically
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    id="qrCode"
                    value={qrCode}
                    onChange={(e) => setQrCode(e.target.value)}
                    placeholder="Enter QR code manually"
                    onKeyPress={(e) => e.key === 'Enter' && handleScan()}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => handleScan()}
                    disabled={isScanning}
                    className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
                  >
                    {isScanning ? 'Scanning...' : 'Scan'}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Enter the QR code manually or switch to camera mode above
                </p>
              </div>
            )}
          </div>

          {scannedData && (
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <FiCheckCircle size={24} />
                  Attendance Marked
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{scannedData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{scannedData.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mobile</p>
                    <p className="font-medium">{scannedData.mobile}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Index No.</p>
                    <p className="font-medium">{scannedData.indexNumber}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>View participant QR codes from the Participants page</li>
            <li>Enter the QR code in the field above</li>
            <li>Click "Scan" or press Enter to mark attendance</li>
            <li>The participant's information will be displayed upon success</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRScanner;
