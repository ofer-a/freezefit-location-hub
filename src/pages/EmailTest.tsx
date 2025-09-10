import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Mail, Loader2 } from 'lucide-react';

interface TestResult {
  success: boolean;
  error?: string;
  details?: string;
  missing_variables?: string[];
  instructions?: string;
  needed_vars?: Record<string, string>;
  email_sent_to?: string;
  brevo_message_id?: string;
  timestamp?: string;
}

const EmailTest = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  const testEmail = async () => {
    setTesting(true);
    setResult(null);

    try {
      const response = await fetch('/.netlify/functions/test-functions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      if (error.message.includes('404')) {
        setResult({
          success: false,
          error: 'Function Not Found (404)',
          details: 'Netlify functions are not deployed properly. The Netlify account owner needs to add environment variables and redeploy the site.'
        });
      } else {
        setResult({
          success: false,
          error: 'Network Error',
          details: error.message
        });
      }
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-blue-600">
              🧪 FreezeFit Email Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                <strong>This page tests the welcome email system.</strong><br />
                Click the button below to send a test email to: <strong>john@softulla.com</strong>
              </AlertDescription>
            </Alert>

            <Button 
              onClick={testEmail} 
              disabled={testing}
              className="w-full h-12 text-lg"
            >
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Sending email...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-5 w-5" />
                  📧 Send Test Email to john@softulla.com
                </>
              )}
            </Button>

            {result && (
              <Alert className={result.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
                {result.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription>
                  {result.success ? (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-green-800">✅ Email Sent Successfully!</h3>
                      <p><strong>Recipient:</strong> {result.email_sent_to}</p>
                      <p><strong>Message ID:</strong> {result.brevo_message_id}</p>
                      {result.timestamp && (
                        <p><strong>Time:</strong> {new Date(result.timestamp).toLocaleString()}</p>
                      )}
                      <p className="font-medium text-green-700">
                        📧 <strong>Check your inbox at john@softulla.com</strong>
                      </p>
                      <p className="text-green-600">🎉 Welcome email system is working perfectly!</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-red-800">❌ Email Failed</h3>
                      <p><strong>Error:</strong> {result.error}</p>
                      {result.details && (
                        <p><strong>Details:</strong> {result.details}</p>
                      )}
                      {result.missing_variables && (
                        <p><strong>Missing:</strong> {result.missing_variables.join(', ')}</p>
                      )}
                      {result.instructions && (
                        <p><strong>Fix:</strong> {result.instructions}</p>
                      )}
                      {result.needed_vars && (
                        <div>
                          <h4 className="font-medium text-red-700 mt-3">Required Environment Variables:</h4>
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            {Object.entries(result.needed_vars).map(([key, description]) => (
                              <li key={key}>
                                <strong>{key}:</strong> {description}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <Alert>
              <AlertDescription>
                <h3 className="font-semibold mb-2">🔧 How It Works:</h3>
                <p>This test page calls the Netlify function which:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>✅ Checks if environment variables are configured</li>
                  <li>✅ Attempts to send email via Brevo API</li>
                  <li>✅ Returns detailed error information if something fails</li>
                </ul>
                <p className="mt-2">
                  <strong>Note:</strong> If the test fails, the error message will show exactly what 
                  environment variables need to be added in the Netlify dashboard.
                </p>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailTest;
