import { useState } from 'react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const { login, register } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister) {
      if (!name || !email || !username || !password) {
        toast({ variant: 'destructive', title: 'Todos los campos son obligatorios' });
        return;
      }
      const ok = await register(name, email, username, password);
      if (ok) {
        toast({ title: '✅ Cuenta creada', description: 'Ahora puedes iniciar sesión' });
        setIsRegister(false);
        setName('');
        setEmail('');
      } else {
        toast({ variant: 'destructive', title: 'El nombre de usuario ya existe' });
      }
    } else {
      const ok = await login(username, password);
      if (!ok) {
        toast({ variant: 'destructive', title: 'Credenciales inválidas' });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="Guardian Inventario" className="w-32 h-32 object-contain mb-2" />
          <p className="text-sm text-muted-foreground mt-1">Gestión de activos tecnológicos</p>
        </div>

        <div className="bg-card rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4">{isRegister ? 'Crear cuenta' : 'Iniciar sesión'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Juan Pérez" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="juan@empresa.com" />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input id="username" value={username} onChange={e => setUsername(e.target.value)} placeholder="cmendez" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full">{isRegister ? 'Registrarse' : 'Entrar'}</Button>
          </form>
          <button
            onClick={() => { setIsRegister(!isRegister); setName(''); setEmail(''); }}
            className="w-full text-center text-xs text-muted-foreground mt-4 hover:text-foreground transition-colors"
          >
            {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
          </button>
          {!isRegister && (
            <p className="text-[10px] text-muted-foreground text-center mt-3">
              Demo: usuario <strong>cmendez</strong> / contraseña <strong>admin123</strong>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
