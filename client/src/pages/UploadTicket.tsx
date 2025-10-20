import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { ticketAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { FiUpload, FiArrowLeft, FiImage } from 'react-icons/fi';

const uploadSchema = Yup.object().shape({
  ticketname: Yup.string().required('Ticket name is required').min(2, 'Name must be at least 2 characters'),
});

const UploadTicket = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (values: any) => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    if (!values.ticketname || values.ticketname.trim() === '') {
      toast.error('Ticket name is required');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('ticketname', values.ticketname);

      await ticketAPI.upload(formData);
      toast.success('Ticket design uploaded successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload ticket design');
    } finally {
      setIsLoading(false);
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
            Upload Ticket Design
          </h1>
          <p className="text-muted-foreground mt-1">Upload pre-designed ticket templates for the event</p>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Ticket Design Details</CardTitle>
          <CardDescription>Upload an image file for the ticket design template</CardDescription>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={{
              ticketname: '',
            }}
            validationSchema={uploadSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched }) => (
              <Form className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="ticketname" className="flex items-center gap-2">
                    <FiImage size={16} />
                    Design Name
                  </Label>
                  <Field
                    as={Input}
                    id="ticketname"
                    name="ticketname"
                    placeholder="e.g., VIP Ticket Design"
                    className={errors.ticketname && touched.ticketname ? 'border-destructive' : ''}
                  />
                  {errors.ticketname && touched.ticketname && (
                    <p className="text-sm text-destructive">{String(errors.ticketname)}</p>
                  )}
                </div>

                <div className="space-y-4">
                  <Label className="flex items-center gap-2">
                    <FiUpload size={16} />
                    Ticket Design Image
                  </Label>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      {previewUrl ? (
                        <div className="space-y-4">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
                          />
                          <p className="text-sm text-muted-foreground">
                            Click to change image
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <FiUpload size={48} className="mx-auto text-gray-400" />
                          <div>
                            <p className="text-lg font-medium">Click to upload image</p>
                            <p className="text-sm text-muted-foreground">
                              PNG, JPG, JPEG up to 10MB
                            </p>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>

                  {selectedFile && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
                    disabled={isLoading || !selectedFile}
                  >
                    {isLoading ? 'Uploading...' : 'Upload Design'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadTicket;
