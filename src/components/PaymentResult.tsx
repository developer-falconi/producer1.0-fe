import { useEffect, useState } from 'react';

export default function PaymentResult({ status }: { status: string }) {
  let titulo = 'status del pago';
  let mensaje = 'No se pudo determinar el status de tu pago.';
  let agradecimiento: string | null = null;

  if (status === 'approved') {
    titulo = 'Pago exitoso 🎉!';
    mensaje = 'Tu pago ha sido aprobado.';
    agradecimiento =
      'Gracias por comprar con Produtik. Los tickets serán enviados a tu correo electrónico en breve.';
  } else if (status === 'pending') {
    titulo = 'Pago pendiente ⏳';
    mensaje = 'Tu pago está pendiente. Te avisaremos cuando se confirme.';
  } else if (['failure', 'cancelled', 'rejected'].includes(status || '')) {
    titulo = 'Pago rechazado ❌';
    mensaje = 'Lo sentimos, tu pago no pudo procesarse.';
  }

  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const tick = 100;
    const decrement = 100 / (8000 / tick);
    const interval = window.setInterval(() => {
      setProgress((prev) => {
        const next = prev - decrement;
        return next > 0 ? next : 0;
      });
    }, tick);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="bg-blue-800/50 backdrop-blur-sm p-8 rounded-lg shadow-lg w-full max-w-md text-white">
      <div className="container mx-auto max-w-xl text-center">
        <h1 className="text-4xl font-bold mb-4">{titulo}</h1>
        <p className="text-lg mb-2">{mensaje}</p>

        {agradecimiento && (
          <div className="mt-4 text-sm text-left font-medium space-y-2">
            {agradecimiento
              .split('.')
              .map((s) => s.trim())
              .filter((s) => s.length > 0)
              .map((line, idx) => (
                <p key={idx}>{line.endsWith('.') ? line : line + '.'}</p>
              ))}
          </div>
        )}
        <div className="relative w-full h-1 bg-white/30 rounded mt-6 overflow-hidden">
          <div
            className="h-full bg-white transition-[width] ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
