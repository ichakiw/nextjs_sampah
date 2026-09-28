import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function POST(request) {
  try {
    const { name, email, phone, password } = await request.json();

    if (!name || !email || !phone || !password) {
      return Response.json(
        { message: 'Semua field wajib diisi' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return Response.json(
        { message: 'Password minimal 6 karakter' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { phone }
        ]
      }
    });

    if (existingUser) {
      return Response.json(
        { message: 'Email atau nomor HP sudah terdaftar' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: 'USER'
      }
    });

    return Response.json({
      message: 'Registrasi berhasil',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return Response.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}