import React, { useState } from 'react';
import { Event, GenderEnum, Participant, Prevent, SpinnerSize, TicketFormData } from '../types/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createPreference, submitTicketForm } from '../services/api';
import Spinner from './Spinner';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/utils';
import MercadoPagoButton from './MercadoPago';

interface TicketFormProps {
  event: Event;
  onGetTickets: () => void;
  prevent?: Prevent;
}

type PaymentMethod = 'transferencia' | 'mercadopago';

const TicketForm: React.FC<TicketFormProps> = ({ event, onGetTickets, prevent }) => {
  const [ticketCount, setTicketCount] = useState<number>(1);
  const [formStep, setFormStep] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mercadopago');

  const [formData, setFormData] = useState<TicketFormData>({
    participants: [{ fullName: '', phone: '', docNumber: '', gender: GenderEnum.HOMBRE }],
    email: '',
    comprobante: null
  });

  const participantCount = formData.participants.length;
  const totalSteps = participantCount + 2;

  const updateParticipant = (index: number, field: keyof Participant, value: string) => {
    const newParticipants = [...formData.participants];
    newParticipants[index] = { ...newParticipants[index], [field]: value };

    setFormData({
      ...formData,
      participants: newParticipants
    });
  };

  const handleTicketCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const count = parseInt(e.target.value);
    setTicketCount(count);
    const currentParticipants = [...formData.participants];

    if (count > currentParticipants.length) {
      for (let i = currentParticipants.length; i < count; i++) {
        currentParticipants.push({ fullName: '', phone: '', docNumber: '', gender: GenderEnum.HOMBRE });
      }
    } else if (count < currentParticipants.length) {
      currentParticipants.splice(count);
    }

    setFormData({
      ...formData,
      participants: currentParticipants
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData({
        ...formData,
        comprobante: e.target.files[0]
      });
    }
  };

  const validateCurrentStep = () => {
    if (formStep === 0) return ticketCount > 0;
    if (formStep >= 1 && formStep <= participantCount) {
      const p = formData.participants[formStep - 1];
      return p.fullName && p.phone && p.docNumber;
    }
    if (formStep === participantCount + 1) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return false;
      if (paymentMethod === 'transferencia' && !formData.comprobante) return false;
    }
    return true;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setFormStep(prev => prev + 1);
    } else {
      toast.error("Error en la información ingresada");
    }
  };

  const prevStep = () => {
    setFormStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCurrentStep()) {
      toast.error("Error en la información ingresada");
      return;
    }
    const updatedParticipants = formData.participants.map(participant => ({
      ...participant,
      email: formData.email
    }));

    setFormData(prevState => ({
      ...prevState,
      participants: updatedParticipants,
    }));

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append('clients', JSON.stringify(updatedParticipants));

      if (formData.comprobante) {
        submitData.append('comprobante', formData.comprobante);
      }

      const result = await submitTicketForm(submitData, event.id);

      if (result.success) {
        toast.success("Entradas solicitadas. Una vez validado tu pago te las enviaremos en un mail");
        resetAll();
      } else {
        toast.error("Error enviando información");
      }
    } catch (error) {
      toast.error("Error enviando información");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToPay = async () => {
    setIsSubmitting(true);
    try {
      const res = await createPreference(prevent!.id, participantCount);
      if (res.success && res.data.preferenceId) {
        setPreferenceId(res.data.preferenceId);
      } else toast.error('Error al generar la preferencia de pago');
    } catch {
      toast.error('Error al contactar a Mercado Pago');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAll = () => {
    setFormStep(0);
    setTicketCount(1);
    setFormData({
      participants: [{ fullName: '', phone: '', docNumber: '', gender: GenderEnum.HOMBRE }],
      email: '',
      comprobante: null
    });
    setPreferenceId(null);
    onGetTickets();
  };

  const renderStepContent = () => {
    if (formStep === 0) {
      return (
        <div className="space-y-4 text-white">
          <div>
            <Label htmlFor="ticketCount">¿Cuántas entradas quieres?</Label>
            <select
              id="ticketCount"
              value={ticketCount}
              onChange={handleTicketCountChange}
              className="w-full p-2 mt-1 border border-producer/30 rounded-md text-white bg-gray-800 focus:border-producer focus:ring-1 focus:ring-producer outline-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 w-full">
            <Button
              onClick={onGetTickets}
              className="w-1/2 bg-red-800 hover:bg-red-700"
            >
              Cancelar
            </Button>
            <Button
              onClick={nextStep}
              className="w-1/2 bg-sky-800 hover:bg-sky-700"
            >
              Siguiente
            </Button>
          </div>
        </div>
      );
    } else if (formStep <= formData.participants.length) {
      const participantIndex = formStep - 1;
      const participant = formData.participants[participantIndex];

      return (
        <div className="space-y-4 text-white">
          <h3 className="text-lg font-semibold text-white">
            Cliente {participantIndex + 1} Información
          </h3>

          <div>
            <Label htmlFor="fullName">Nombre completo</Label>
            <Input
              id="fullName"
              value={participant.fullName || ''}
              onChange={(e) => updateParticipant(participantIndex, 'fullName', e.target.value)}
              className="bg-producer-dark/50 border-producer/30 text-white"
              placeholder="Nombre completo..."
            />
          </div>

          <div>
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              value={participant.phone || ''}
              onChange={(e) => updateParticipant(participantIndex, 'phone', e.target.value)}
              className="bg-producer-dark/50 border-producer/30 text-white"
              placeholder="Teléfono..."
            />
          </div>

          <div>
            <Label htmlFor="dni">DNI</Label>
            <Input
              id="dni"
              value={participant.docNumber || ''}
              onChange={(e) => updateParticipant(participantIndex, 'docNumber', e.target.value)}
              className="bg-producer-dark/50 border-producer/30 text-white"
              placeholder="DNI..."
            />
          </div>

          <div>
            <Label>Genero</Label>
            <Select
              value={participant.gender || GenderEnum.HOMBRE}
              onValueChange={(value) => updateParticipant(participantIndex, 'gender', value)}
            >
              <SelectTrigger className="w-full p-2 mt-1 bg-producer-dark/50 border border-producer/30 rounded-md">
                <SelectValue placeholder={GenderEnum.HOMBRE} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={GenderEnum.HOMBRE}>{GenderEnum.HOMBRE}</SelectItem>
                <SelectItem value={GenderEnum.MUJER}>{GenderEnum.MUJER}</SelectItem>
                <SelectItem value={GenderEnum.OTRO}>{GenderEnum.OTRO}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between gap-4">
            <Button
              onClick={prevStep}
              className="w-1/2 bg-red-800 hover:bg-red-700"
            >
              Atrás
            </Button>
            <Button
              onClick={nextStep}
              className="w-1/2 bg-sky-800 hover:bg-sky-700"
            >
              Siguiente
            </Button>
          </div>
        </div>
      );
    } if (formStep === participantCount + 1) {
      return (
        <div className="space-y-4 text-white">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            className="bg-producer-dark/50 border-producer/30 text-white"
          />

          <Label className="block">Selecciona método de pago</Label>
          <div className="flex gap-6 !mb-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === 'transferencia'}
                onChange={() => setPaymentMethod('transferencia')}
                className="h-5 w-5 border bg-gray-800 rounded-none text-blue-800 focus:ring-2 focus:ring-blue-600 cursor-pointer"
              />
              <span className="text-white">Transferencia</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === 'mercadopago'}
                onChange={() => setPaymentMethod('mercadopago')}
                className="h-5 w-5 border bg-gray-800 rounded-none text-blue-800 focus:ring-2 focus:ring-blue-600 cursor-pointer"
              />
              <span className="text-white">MercadoPago</span>
            </label>
          </div>

          {paymentMethod === 'transferencia' && (
            <>
              <Label htmlFor="comprobante">Subí tu comprobante</Label>
              <Input
                id="comprobante"
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="bg-[#5e5e5e] border-producer/30 text-white"
              />
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="mt-4 w-full bg-green-800"
              >
                {isSubmitting ? <Spinner size={SpinnerSize.SMALL} /> : 'Enviar'}
              </Button>
            </>
          )}

          {paymentMethod === 'mercadopago' && (
            <div className="text-center mt-4">
              {!preferenceId ? (
                <Button
                  onClick={handleGoToPay}
                  disabled={formData.email.length === 0}
                  className="bg-green-600 hover:bg-green-500 px-6 py-2"
                >
                  {isSubmitting ? 'Generando pago...' : 'Ir a pagar'}
                </Button>
              ) : (
                <MercadoPagoButton preferenceId={preferenceId} />
              )}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-black/70 backdrop-blur-sm p-4 rounded-lg shadow-lg w-full max-w-md">
      {prevent && (
        <div className="mb-4">
          <div>
            <h2 className="text-2xl font-bold text-green-600 mb-3">
              {prevent.name}
            </h2>
          </div>

          {formStep + 1 === formData.participants.length + 2 && (
            <div className="space-y-2">
              <h3
                className='text-xl font-bold text-blue-600'
              >
                Total: {formatPrice(prevent.price * formData.participants.length)}
              </h3>
              <div className="!my-4 border-b" />
            </div>
          )}
        </div>
      )}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Entradas</h2>
          <div className="text-sm text-green-600">
            Paso {formStep + 1} de {totalSteps}
          </div>
        </div>

        <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
          <div
            className="bg-green-600 h-full transition-all duration-300 ease-in-out"
            style={{
              width: `${((formStep + 1) / (totalSteps)) * 100}%`
            }}
          />
        </div>
      </div>

      {renderStepContent()}
    </div>
  );
};

export default TicketForm;