import React, { useMemo, useState } from 'react';
import { Event, GenderEnum, Participant, Prevent, PreventStatusEnum, SpinnerSize, TicketFormData } from '../types/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createPreference, submitTicketForm } from '../services/api';
import Spinner from './Spinner';
import { toast } from 'sonner';
import { cn, formatPrice } from '@/lib/utils';
import MercadoPagoButton from './MercadoPago';
import SelectableCardList from './SelectablePrevents';

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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transferencia');
  const [selectedPreventId, setSelectedPreventId] = useState<number | null>(null);

  const activePrevents = useMemo(
    () => event.prevents.filter(p => p.status === PreventStatusEnum.ACTIVE),
    [event.prevents]
  );
  const selectedPrevent = activePrevents.find(p => p.id === selectedPreventId);

  const [formData, setFormData] = useState<TicketFormData>({
    participants: [{ fullName: '', phone: '', docNumber: '', gender: GenderEnum.HOMBRE }],
    email: '',
    comprobante: null
  });

  const participantCount = formData.participants.length;
  const totalSteps = participantCount + 3;
  const mpFeeRate = 0.0824;
  const baseTotal = (selectedPrevent?.price || 0) * formData.participants.length;
  const totalPrice = paymentMethod === 'mercadopago'
    ? Math.round(baseTotal * (1 + mpFeeRate) * 100) / 100
    : baseTotal;

  const feeTotal = Math.round((totalPrice - baseTotal) * 100) / 100;
  const feePerService = Math.round((feeTotal / formData.participants.length) * 100) / 100;

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
    if (formStep === 0) return !!selectedPrevent;
    if (formStep === 1) return ticketCount > 0;
    if (formStep <= participantCount) {
      const p = formData.participants[formStep - 2];
      return !!(p.fullName && p.phone && p.docNumber);
    }
    if (formStep === participantCount + 2) {
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

      const result = await submitTicketForm(submitData, event.id, selectedPreventId);

      if (result.success) {
        toast.success("Entradas solicitadas. Una vez validado tu pago te las enviaremos por mail");
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
    const updatedParticipants = formData.participants.map(participant => ({
      ...participant,
      email: formData.email
    }));
    try {
      const res = await createPreference(selectedPreventId!, updatedParticipants);
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
          <SelectableCardList
            activePrevents={activePrevents}
            selectedPreventId={selectedPreventId}
            setSelectedPreventId={setSelectedPreventId}
          />

          <div className="flex items-center gap-2 w-full">
            <Button onClick={onGetTickets} className="w-1/2 bg-red-800 hover:bg-red-700">
              Cancelar
            </Button>
            <Button
              onClick={() => setFormStep(1)}
              disabled={!selectedPrevent}
              className="w-1/2 bg-sky-800 hover:bg-sky-700"
            >
              Continuar
            </Button>
          </div>
        </div>
      );
    } else if (formStep === 1) {
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
    } else if (formStep > 1 && formStep <= 1 + participantCount) {
      const participantIndex = formStep - 2;
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
    } if (formStep === participantCount + 2) {
      return (
        <div className="space-y-4 text-white">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            placeholder='Ingresa tu mail...'
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            className="bg-producer-dark/50 border-producer/30 text-white"
          />

          <Label className="block">Selecciona método de pago</Label>
          <div className="flex gap-6 !mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <Input
                type="radio"
                name="payment"
                checked={paymentMethod === 'transferencia'}
                onChange={() => setPaymentMethod('transferencia')}
                className="h-5 w-5 border bg-gray-800 rounded-none text-blue-800 focus:ring-2 focus:ring-blue-600"
              />
              <span className="text-white">Transferencia</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === 'mercadopago'}
                onChange={() => setPaymentMethod('mercadopago')}
                className="h-5 w-5 border bg-gray-800 rounded-none text-blue-800 focus:ring-2 focus:ring-blue-600"
              />
              <span className="text-white">MercadoPago</span>
            </label>
          </div>

          {paymentMethod === 'transferencia' && (
            <div className='flex flex-col gap-2'>
              <p className='text-lg font-bold text-white text-left'>
                Alias: {event.alias}
              </p>
              <p className='italic text-xs text-blue-600 text-left'>La acreditación demora hasta 3 días</p>
              <Label htmlFor="comprobante">Subí tu comprobante</Label>
              <Input
                id="comprobante"
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="bg-[#5e5e5e] border-producer/30 text-white"
              />
              <div className="flex items-center mt-4 gap-4">
                <Button
                  onClick={prevStep}
                  className="w-1/2 bg-red-800 hover:bg-red-700"
                >
                  Atrás
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={formData.email.length === 0}
                  className="w-1/2 bg-green-800 hover:bg-green-700"
                >
                  {isSubmitting ? <Spinner size={SpinnerSize.SMALL} /> : 'Enviar'}
                </Button>
              </div>
            </div>
          )}

          {paymentMethod === 'mercadopago' && (
            <div className="text-center mt-4">
              <p className='italic text-xs text-blue-600 text-left'>Acreditación instantanea</p>
              {!preferenceId ? (
                <div className="flex items-center mt-4 gap-4">
                  <Button
                    onClick={prevStep}
                    className="w-1/2 bg-red-800 hover:bg-red-700"
                  >
                    Atrás
                  </Button>
                  <Button
                    onClick={handleGoToPay}
                    disabled={formData.email.length === 0}
                    className="w-1/2 bg-green-800 hover:bg-green-700"
                  >
                    {isSubmitting ? 'Generando pago...' : 'Ir a pagar'}
                  </Button>
                </div>
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
      {prevent && selectedPrevent && formStep >= 1 && (
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h2
              className={cn(
                formStep === formData.participants.length + 2 ? 'text-lg' : 'text-2xl',
                'font-bold text-green-600 mb-3'
              )}
            >
              {selectedPrevent.name}
            </h2>
            <h2
              className={cn(
                formStep === formData.participants.length + 2 ? 'text-lg' : 'text-2xl',
                'font-bold text-green-600 mb-3'
              )}
            >
              {formatPrice(selectedPrevent.price)}
            </h2>
          </div>

          {formStep === formData.participants.length + 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
              <div>
                <h3 className="text-xs font-bold text-blue-600">
                  Subtotal: {formatPrice(baseTotal)}
                </h3>
                <h3 className="text-xs font-bold text-blue-600">
                  Cargo de servicio: {formatPrice(feePerService)}
                </h3>
              </div>
              <div className="text-right">
                <h3 className="text-2xl font-bold text-blue-700">
                  Total: {formatPrice(totalPrice)}
                </h3>
              </div>
              <div className="col-span-2 border-b mt-2" />
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
