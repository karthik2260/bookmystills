import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ADMIN } from '../../../config/constants/constants';
import { useFormik } from "formik";
import { loginValidationSchema } from '../../../validations/common/loginValidate';
import { showToastMessage } from '../../../validations/common/toast';
import AdminRootState from '@/redux/rootstate/AdminState';
import { Eye, EyeOff } from 'lucide-react';
import { setAdminInfo } from '@/redux/slices/AdminSlice';
import { adminLoginService } from '@/services/adminAuthService';
import axios from 'axios';

interface FormValues {
  email: string;
  password: string;
}

const initialValues: FormValues = { email: '', password: '' };

const Login = () => {
  const admin = useSelector((state: AdminRootState) => state.admin.adminData);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (admin && token) navigate(`/admin${ADMIN.DASHBOARD}`);
  }, [navigate, admin]);

  const formik = useFormik({
    initialValues,
    validationSchema: loginValidationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const data = await adminLoginService(values);
        localStorage.setItem('adminToken', data.token);
        dispatch(setAdminInfo(data.adminData));
        showToastMessage(data.message, 'success');
        navigate(`/admin${ADMIN.DASHBOARD}`);
      } catch (error) {
        let errorMessage = 'An error occurred during login';
        if (axios.isAxiosError(error)) {
          errorMessage = error.response?.data?.message || errorMessage;
        }
        showToastMessage(errorMessage, 'error');
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  return (
    <div className="min-h-screen bg-[#f5f5f3] flex items-center justify-center p-4">

      {/* Card */}
      <div className="w-full max-w-sm">

        {/* Logo mark */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center mb-3">
            <div className="w-5 h-5 rounded-sm bg-white" />
          </div>
          <h1 className="text-sm font-bold text-gray-900 tracking-widest uppercase">Bookmystills</h1>
          <p className="text-xs text-gray-400 mt-0.5">Admin Console</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">Sign in</h2>
            <p className="text-sm text-gray-400 mt-0.5">Enter your credentials to continue</p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="admin@bookmystills.com"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                autoComplete="email"
                className={`w-full px-3.5 py-2.5 text-sm bg-gray-50 border rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:bg-white transition-all duration-150 ${
                  formik.touched.email && formik.errors.email
                    ? 'border-red-300 focus:ring-red-500/20'
                    : 'border-gray-200 focus:ring-gray-900/10 focus:border-gray-400'
                }`}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-xs text-red-500 mt-1.5">{formik.errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                  autoComplete="current-password"
                  className={`w-full px-3.5 py-2.5 pr-10 text-sm bg-gray-50 border rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:bg-white transition-all duration-150 ${
                    formik.touched.password && formik.errors.password
                      ? 'border-red-300 focus:ring-red-500/20'
                      : 'border-gray-200 focus:ring-gray-900/10 focus:border-gray-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="text-xs text-red-500 mt-1.5">{formik.errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: isSubmitting ? '#555' : '#0f0f0f' }}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Bookmystills © {new Date().getFullYear()} · Admin Portal
        </p>
      </div>
    </div>
  );
};

export default Login;