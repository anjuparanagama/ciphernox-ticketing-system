import { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { authAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { FiLock, FiUser } from 'react-icons/fi';

const loginSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
});

const Login = () => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: { username: string; password: string }) => {
    setIsLoading(true);
    try {
      const response: any = await authAPI.login(values);
      login(response.data.token);
      toast.success('Login successful!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-secondary p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Ciphernox 2025
          </CardTitle>
          <CardDescription className="text-base">IT Get-Together Ticket System</CardDescription>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={{ username: '', password: '' }}
            validationSchema={loginSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched }) => (
              <Form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="flex items-center gap-2">
                    <FiUser size={16} />
                    Username
                  </Label>
                  <Field
                    as={Input}
                    id="username"
                    name="username"
                    placeholder="Enter your username"
                    className={errors.username && touched.username ? 'border-destructive' : ''}
                  />
                  {errors.username && touched.username && (
                    <p className="text-sm text-destructive">{errors.username}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <FiLock size={16} />
                    Password
                  </Label>
                  <Field
                    as={Input}
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    className={errors.password && touched.password ? 'border-destructive' : ''}
                  />
                  {errors.password && touched.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  Demo: username: <strong>admin</strong> | password: <strong>admin</strong>
                </p>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
