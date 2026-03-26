import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { showToastMessage } from '../../validations/common/toast';
import { VENDOR } from '../../config/constants/constants';
import { Sparkles, ShieldCheck, Clock } from 'lucide-react';
import { verifyVendorOtpApi,resendVendorOtpApi } from '@/services/Verifyemailvendorapi';
const images = [
  '/images/login.webp',
  '/images/event1.jpg',
  '/images/event2.jpg'
];

interface FormValues {
  otp: string;
}

const validationSchema = Yup.object().shape({
  otp: Yup.string()
    .required('OTP is required')
    .matches(/^[0-9]+$/, 'Must be only digits')
    .min(4, 'Must be exactly 4 digits')
    .max(4, 'Must be exactly 4 digits')
});

const VerifyEmailVendor = () => {
  const [imageIndex, setImageIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const otpData = localStorage.getItem('otpData');
    if (!otpData) {
      navigate('/vendor/signup');
      return;
    }

    const { otpExpiry, resendAvailableAt } = JSON.parse(otpData);
    const now = Date.now();

    if (otpExpiry > now) {
      setTimeLeft(Math.floor((otpExpiry - now) / 1000));
      setResendDisabled(resendAvailableAt > now);

      const interval = setInterval(() => {
        const currentTime = Date.now();
        if (otpExpiry > currentTime) {
          setTimeLeft(Math.floor((otpExpiry - currentTime) / 1000));
          setResendDisabled(resendAvailableAt > currentTime);
        } else {
          setTimeLeft(0);
          setResendDisabled(false);
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setTimeLeft(0);
      setResendDisabled(false);
    }
  }, [navigate]);

  const handleVerify = async (
    values: FormValues,
    { setSubmitting, setFieldError }: FormikHelpers<FormValues>
  ) => {
    setIsLoading(true);
    try {
      const data = await verifyVendorOtpApi(values.otp);
      showToastMessage(data.message, 'success');
      if (data.vendor) {
        localStorage.removeItem('otpData');
        navigate(`${VENDOR.LOGIN}`);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Invalid OTP';
        setFieldError('otp', errorMessage);
        showToastMessage(errorMessage, 'error');
        if (error.response?.status === 400 && errorMessage === 'Session expired. Please sign up again.') {
          setTimeout(() => navigate('/signup'), 2000);
        }
      } else {
        showToastMessage('An unexpected error occurred. Please try again.', 'error');
      }
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendDisabled) return;
    setIsLoading(true);
    try {
      const data = await resendVendorOtpApi();
      const otpData = JSON.parse(localStorage.getItem('otpData') || '{}');
      localStorage.setItem('otpData', JSON.stringify({
        ...otpData,
        otpExpiry: data.otpExpiry,
        resendAvailableAt: data.resendAvailableAt,
      }));
      showToastMessage(data.message, 'success');
      setTimeLeft(Math.floor((data.otpExpiry - Date.now()) / 1000));
      setResendDisabled(true);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        showToastMessage(
          error.response?.data?.message || error.message || 'An error occurred',
          'error'
        );
      } else {
        showToastMessage('An unexpected error occurred. Please try again.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const timerPercent = timeLeft && timeLeft > 0 ? Math.min((timeLeft / 120) * 100, 100) : 0;

  return (
    <div className="w-full h-screen flex overflow-hidden">

      {/* ── LEFT: Image / Brand Panel ── */}
      <div
        className="hidden md:flex md:w-1/2 relative flex-col justify-between p-12 overflow-hidden"
        style={{
          backgroundImage: images[imageIndex] ? `url(${images[imageIndex]})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-blue-900/70 to-indigo-900/80" />

        <div className="relative z-10 flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="text-white font-semibold text-lg tracking-wide">bookmystills</span>
        </div>

        <div className="relative z-10 space-y-4">
          <h1 className="text-4xl font-bold text-white leading-tight">
            One Step<br />Away From Access
          </h1>
          <p className="text-blue-100 text-base leading-relaxed max-w-xs">
            Enter the verification code sent to your email to activate your vendor account.
          </p>
          <div className="flex gap-3 pt-2">
            {[['500+', 'Vendors'], ['10k+', 'Events'], ['98%', 'Satisfaction']].map(([num, label]) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 text-center">
                <p className="text-white font-bold text-sm">{num}</p>
                <p className="text-blue-200 text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT: OTP Panel ── */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 px-6 py-10">
        <div className="w-full max-w-md space-y-7">

          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
              <ShieldCheck size={32} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-1">Verification</p>
              <h2 className="text-3xl font-bold text-gray-900">Check your email</h2>
              <p className="text-sm text-gray-500 mt-1">
                We've sent a 4-digit OTP to your registered email address
              </p>
            </div>
          </div>

          <Formik
            initialValues={{ otp: '' }}
            validationSchema={validationSchema}
            onSubmit={handleVerify}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-5">

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Enter OTP</label>
                  <Field
                    type="text"
                    name="otp"
                    placeholder="e.g. 1234"
                    maxLength={4}
                    disabled={isLoading || isSubmitting}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-center text-2xl font-bold tracking-[0.5em] shadow-sm outline-none transition
                      focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <ErrorMessage
                    name="otp"
                    component="p"
                    className="text-xs text-red-500 mt-1"
                  />
                </div>

                {timeLeft !== null && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 text-gray-500">
                        <Clock size={14} />
                        Time remaining
                      </span>
                      <span className={`font-semibold tabular-nums ${
                        timeLeft > 30 ? 'text-blue-600' :
                        timeLeft > 10 ? 'text-amber-500' : 'text-red-500'
                      }`}>
                        {timeLeft > 0 ? formatTime(timeLeft) : 'Expired'}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          timerPercent > 50 ? 'bg-blue-500' :
                          timerPercent > 20 ? 'bg-amber-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${timerPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isLoading || resendDisabled || isSubmitting}
                    className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600
                      hover:bg-gray-100 transition
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                        Sending…
                      </span>
                    ) : 'Resend OTP'}
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading || isSubmitting || !timeLeft || timeLeft === 0}
                    className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold
                      shadow-md shadow-blue-200 transition
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Verifying…
                      </span>
                    ) : 'Verify OTP'}
                  </button>
                </div>

                {timeLeft === 0 && (
                  <p className="text-center text-xs text-red-500">
                    Your OTP has expired. Please request a new one.
                  </p>
                )}

              </Form>
            )}
          </Formik>

        </div>
      </div>
    </div>
  );
};

export default VerifyEmailVendor;