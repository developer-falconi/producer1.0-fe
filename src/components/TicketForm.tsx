import React, { useState } from 'react';
import { Event, GenderEnum, Participant, Prevent, SpinnerSize, TicketFormData } from '../types/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { submitTicketForm } from '../services/api';
import Spinner from './Spinner';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/utils';

interface TicketFormProps {
  event: Event;
  onGetTickets: () => void;
  prevent?: Prevent;
}

const TicketForm: React.FC<TicketFormProps> = ({ event, onGetTickets, prevent }) => {
  const [ticketCount, setTicketCount] = useState<number>(1);
  const [formStep, setFormStep] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [formData, setFormData] = useState<TicketFormData>({
    participants: [{ fullName: '', phone: '', dni: '', gender: GenderEnum.HOMBRE }],
    email: '',
    comprobante: null
  });

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

    // Adjust participants array based on ticket count
    const currentParticipants = [...formData.participants];

    if (count > currentParticipants.length) {
      // Add more participant slots
      for (let i = currentParticipants.length; i < count; i++) {
        currentParticipants.push({ fullName: '', phone: '', dni: '', gender: GenderEnum.HOMBRE });
      }
    } else if (count < currentParticipants.length) {
      // Remove excess participant slots
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
    if (formStep === 0) {
      // Validate ticket count selection
      return ticketCount > 0;
    } else if (formStep < formData.participants.length + 1) {
      // Validate current participant data
      const participantIndex = formStep - 1;
      const participant = formData.participants[participantIndex];
      return (
        participant.fullName.trim() !== '' &&
        participant.phone.trim() !== '' &&
        participant.dni.trim() !== '' &&
        participant.gender !== '' as GenderEnum
      );
    } else {
      // Validate email and comprobante
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return (
        emailRegex.test(formData.email) &&
        formData.comprobante !== null
      );
    }
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
        toast.success("Entradas solicitadas");

        // Reset form
        setFormStep(0);
        setTicketCount(1);
        setFormData({
          participants: [{ fullName: '', phone: '', dni: '', gender: GenderEnum.HOMBRE }],
          email: '',
          comprobante: null
        });
      } else {
        toast.error("Error enviando información");
      }
    } catch (error) {
      toast.error("Error enviando información");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    if (formStep === 0) {
      // Ticket quantity selection
      return (
        <div className="space-y-4 text-white">
          <div>
            <Label htmlFor="ticketCount">¿Cuántas entradas quieres?</Label>
            <select
              id="ticketCount"
              value={ticketCount}
              onChange={handleTicketCountChange}
              className="w-full p-2 mt-1 bg-producer-dark/50 border border-producer/30 rounded-md text-white focus:border-producer focus:ring-1 focus:ring-producer outline-none"
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
      // Participant information
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
              value={participant.dni || ''}
              onChange={(e) => updateParticipant(participantIndex, 'dni', e.target.value)}
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
    } else {
      // Final step - Email and Payment Proof
      return (
        <div className="space-y-4 text-white">
          <h3 className="text-lg font-semibold text-white">
            Contacto & Pago
          </h3>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-producer-dark/50 border-producer/30 text-white"
              placeholder="Email..."
            />
          </div>

          <div>
            <Label htmlFor="comprobante">Comprobante</Label>
            <Input
              id="comprobante"
              type="file"
              onChange={handleFileChange}
              className="bg-[#5e5e5e] border-producer/30 text-white cursor-pointer"
              accept="image/*"
            />
            <p className="text-xs text-gray-400 mt-1">Subi el comprobante</p>
          </div>

          <div className="flex justify-between gap-4">
            <Button
              onClick={prevStep}
              className="w-1/2 bg-red-800 hover:bg-red-700"
            >
              Atras
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-1/2 bg-green-800 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Spinner size={SpinnerSize.SMALL} />
                  Enviando...
                </>
              ) : (
                'Enviar'
              )}
            </Button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="bg-black/50 backdrop-blur-sm p-6 rounded-lg shadow-lg w-full max-w-md">
      {prevent && (
        <div className="flex flex-col gap-2 mb-2">
          <p className="text-green-800 text-2xl font-bold">
            {prevent.name}: {formatPrice(prevent.price)}
          </p>
          <div className="flex items-start gap-2"> {/* Use a flex container */}
            <p className="text-white font-bold text-lg m-0 min-w-[50px] sm:min-w-[70px] md:min-w-[80px] lg:min-w-[90px]">
              Alias:
            </p>
            {event.alias ? (
              event.alias.includes('/') ? (
                <div className="flex flex-col">
                  {event.alias.split('/').map((part, index) => (
                    <span key={index} className="text-white text-lg text-start">
                      {part.trim()}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-white text-lg m-0">
                  {event.alias.trim()}
                </p>
              )
            ) : (
              <p className="text-gray-500 text-lg m-0">
                No Alias
              </p>
            )}
          </div>
        </div>
      )}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Entradas</h2>
          <div className="text-sm text-purple-300">
            Paso {formStep + 1} de {formData.participants.length + 2}
          </div>
        </div>

        <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
          <div
            className="bg-purple-600 h-full transition-all duration-300 ease-in-out"
            style={{
              width: `${((formStep + 1) / (formData.participants.length + 2)) * 100}%`
            }}
          />
        </div>
      </div>

      {renderStepContent()}
    </div>
  );
};

export default TicketForm;