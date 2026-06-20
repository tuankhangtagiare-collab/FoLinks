import { z } from "zod";

// Base password rule: min 8 chars, at least 1 uppercase, 1 lowercase, 1 number, 1 special character
export const passwordSchema = z
  .string()
  .min(8, "Mật khẩu phải dài ít nhất 8 ký tự")
  .regex(/[A-Z]/, "Mật khẩu phải chứa ít nhất 1 chữ hoa")
  .regex(/[a-z]/, "Mật khẩu phải chứa ít nhất 1 chữ thường")
  .regex(/[0-9]/, "Mật khẩu phải chứa ít nhất 1 chữ số")
  .regex(/[^A-Za-z0-9]/, "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt");

export const RegisterSchema = z
  .object({
    username: z
      .string()
      .min(3, "Tên đăng nhập phải từ 3 đến 20 ký tự")
      .max(20, "Tên đăng nhập tối đa 20 ký tự")
      .regex(/^[a-zA-Z0-9_]+$/, "Tên đăng nhập chỉ chứa chữ cái, số và dấu gạch dưới"),
    email: z.string().email("Địa chỉ email không hợp lệ"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Xác nhận mật khẩu không trùng khớp",
    path: ["confirmPassword"],
  });

export const LoginSchema = z.object({
  usernameOrEmail: z.string().min(1, "Vui lòng nhập tên đăng nhập hoặc email"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Địa chỉ email không hợp lệ"),
});

export const ResetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token không hợp lệ"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Xác nhận mật khẩu không trùng khớp",
    path: ["confirmPassword"],
  });

export const VerifyEmailSchema = z.object({
  token: z.string().min(1, "Token không hợp lệ"),
});

export const CreateLinkSchema = z.object({
  originalUrl: z.string().url("Địa chỉ URL không hợp lệ"),
  slug: z
    .string()
    .max(50, "Đường dẫn tùy chỉnh tối đa 50 ký tự")
    .regex(/^[a-zA-Z0-9_-]*$/, "Đường dẫn tùy chỉnh chỉ chứa chữ cái, số, dấu gạch ngang và gạch dưới")
    .optional()
    .or(z.literal("")),
  title: z.string().max(255).optional(),
  description: z.string().optional(),
  password: z.string().optional(),
  targetCountry: z.string().optional(),
  targetDevice: z.string().optional(),
});

export const WithdrawRequestSchema = z.object({
  bankName: z.string().min(1, "Vui lòng chọn ngân hàng"),
  accountNumber: z.string().min(5, "Số tài khoản không hợp lệ"),
  accountName: z.string().min(2, "Tên chủ tài khoản không hợp lệ"),
  amount: z
    .number()
    .positive("Số tiền phải lớn hơn 0")
    .refine((val) => val >= 5, "Số tiền rút tối thiểu là $5"),
});
