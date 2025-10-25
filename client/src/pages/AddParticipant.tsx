import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { participantAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { FiUser, FiMail, FiPhone, FiHash, FiArrowLeft, FiImage } from 'react-icons/fi';

const participantSchema = Yup.object().shape({
  name: Yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  mobile: Yup.string()
    .required('Mobile number is required')
    .matches(/^[0-9]{10}$/, 'Mobile number must be 10 digits'),
  indexNumber: Yup.string().required('Index number is required'),
});

const AddParticipant = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: any, { resetForm }: any) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('email', values.email);
      formData.append('mobile', values.mobile);
      formData.append('indexNumber', values.indexNumber);
      if (values.profile_image) {
        formData.append('profile_image', values.profile_image);
      }

      await participantAPI.create(formData);
      toast.success('Participant added successfully!');
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add participant');
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
            Add Participant
          </h1>
          <p className="text-muted-foreground mt-1">Register a new participant for the event</p>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Participant Details</CardTitle>
          <CardDescription>Fill in the information below to add a new participant</CardDescription>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={{
              name: '',
              email: '',
              mobile: '',
              indexNumber: '',
              profile_image: null,
            }}
            validationSchema={participantSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, setFieldValue }) => (
              <Form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <FiUser size={16} />
                    Full Name
                  </Label>
                  <Field
                    as={Input}
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    className={errors.name && touched.name ? 'border-destructive' : ''}
                  />
                  {errors.name && touched.name && (
                    <p className="text-sm text-destructive">{String(errors.name)}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <FiMail size={16} />
                    Email Address
                  </Label>
                  <Field
                    as={Input}
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    className={errors.email && touched.email ? 'border-destructive' : ''}
                  />
                  {errors.email && touched.email && (
                    <p className="text-sm text-destructive">{String(errors.email)}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile" className="flex items-center gap-2">
                    <FiPhone size={16} />
                    Mobile Number
                  </Label>
                  <Field
                    as={Input}
                    id="mobile"
                    name="mobile"
                    placeholder="1234567890"
                    className={errors.mobile && touched.mobile ? 'border-destructive' : ''}
                  />
                  {errors.mobile && touched.mobile && (
                    <p className="text-sm text-destructive">{String(errors.mobile)}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="indexNumber" className="flex items-center gap-2">
                    <FiHash size={16} />
                    Index Number
                  </Label>
                  <Field
                    as={Input}
                    id="indexNumber"
                    name="indexNumber"
                    placeholder="2025001"
                    className={errors.indexNumber && touched.indexNumber ? 'border-destructive' : ''}
                  />
                  {errors.indexNumber && touched.indexNumber && (
                    <p className="text-sm text-destructive">{String(errors.indexNumber)}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile_image" className="flex items-center gap-2">
                    <FiImage size={16} />
                    Profile Image (Optional)
                  </Label>
                  <input
                    type="file"
                    id="profile_image"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.currentTarget.files?.[0];
                      if (file) {
                        setFieldValue('profile_image', file);
                      }
                    }}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Adding...' : 'Add Participant'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/participants')}
                  >
                    View All
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

export default AddParticipant;
