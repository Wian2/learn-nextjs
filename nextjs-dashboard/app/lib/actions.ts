'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import postgres from 'postgres';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { createClient } from '@/lib/supabase/server';
import { fromDateTimeLocal } from './time';
 
const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
 
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
  .number()
  .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});
 
const CreateInvoice = FormSchema.omit({ id: true, date: true });

const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export type EntityFormState = {
  errors?: {
    full_name?: string[];
    phone?: string[];
    date_of_birth?: string[];
    patient_id?: string[];
    starts_at?: string[];
    status?: string[];
  };
  message?: string | null;
};
 
export async function createInvoice(prevState: State, formData: FormData) {
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    // We'll also log the error to the console for now
    // console.error(error);
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData,
) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }
 
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
 
  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }
 
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  throw new Error('Failed to Delete Invoice');

  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath('/dashboard/invoices');
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

export async function signInWithSupabase(
  prevState: string | undefined,
  formData: FormData,
) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return 'Please enter your email and password.';
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Supabase sign-in error:', error);
    return 'Invalid email or password.';
  }

  redirect('/dashboard');
}

export async function signUpWithSupabase(
  prevState: string | undefined,
  formData: FormData,
) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return 'Please enter an email and password.';
  }

  if (password.length < 6) {
    return 'Password must be at least 6 characters.';
  }

  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

  const { error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/callback`,
  },
});

  if (error) {
    console.error('Supabase sign-up error:', error);
    return error.message;
  }

  redirect('/login');
}

export async function signOutWithSupabase() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}


async function getCurrentClinic(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login');
  }

  const { data: membership, error } = await supabase
    .from('clinic_members')
    .select('clinic_id, role')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  if (error || !membership) {
    console.error('Failed to get clinic membership:', error?.message);
    throw new Error('Your account is not assigned to a clinic.');
  }

  return {
    user,
    clinicId: membership.clinic_id,
    role: membership.role,
  };
}


export async function createPatient(
  _prevState: EntityFormState,
  formData: FormData,
): Promise<EntityFormState> {
  const fullName = String(formData.get('full_name') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim();
  const dateOfBirth = String(
    formData.get('date_of_birth') ?? '',
  ).trim();

  const errors: NonNullable<EntityFormState['errors']> = {};
  if (!fullName) {
    errors.full_name = ["Enter the patient's full name."];
  } else if (fullName.length > 150) {
    errors.full_name = ['The full name must be 150 characters or fewer.'];
  }
  if (phone.length > 30) {
    errors.phone = ['The phone number must be 30 characters or fewer.'];
  }

  if (dateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
    errors.date_of_birth = ['Enter a valid date of birth.'];
  }
  if (Object.keys(errors).length > 0) {
    return { errors, message: 'Please correct the highlighted fields.' };
  }

  const supabase = await createClient();
  const { user, clinicId } = await getCurrentClinic(supabase);

  const { error } = await supabase.from('patients').insert({
    user_id: user.id,
    clinic_id: clinicId,
    full_name: fullName,
    phone: phone || null,
    date_of_birth: dateOfBirth || null,
  });

  if (error) {
    console.error('Failed to create patient:', error.message);
    return { message: 'Could not register the patient. Please try again.' };
  }

  revalidatePath('/dashboard/patients');
  redirect('/dashboard/patients');
}


export async function updatePatient(
  id: string,
  prevState: State,
  formData: FormData,
): Promise<State> {
  const fullName = String(formData.get('full_name') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim();
  const dateOfBirth = String(
    formData.get('date_of_birth') ?? '',
  ).trim();

  if (!fullName || fullName.length > 150 || phone.length > 30) {
    return {
      message: 'Please provide valid patient details.',
    };
  }

  if (
    dateOfBirth &&
    !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)
  ) {
    return {
      message: 'Please provide a valid date of birth.',
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login');
  }

  const { data, error } = await supabase
    .from('patients')
    .update({
      full_name: fullName,
      phone: phone || null,
      date_of_birth: dateOfBirth || null,
    })
    .eq('id', id)
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('Failed to update patient:', error.message);
    return {
      message: 'Could not update the patient. Please try again.',
    };
  }

  if (!data) {
    return {
      message: 'Patient not found or you do not have permission to edit this record.',
    };
  }

  revalidatePath('/dashboard/patients');
  revalidatePath(`/dashboard/patients/${id}/edit`);
  redirect('/dashboard/patients');
}


const AppointmentSchema = z.object({
  patient_id: z.preprocess(
    (value) => (value === null ? undefined : value),
    z
      .string({ required_error: 'Select a patient.' })
      .min(1, 'Select a patient.')
      .refine(
        (value) =>
          value.length === 0 ||
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            value,
          ),
        'Select a valid patient.',
      ),
  ),
  starts_at: z.preprocess(
    (value) => (value === null ? undefined : value),
    z
      .string({ required_error: 'Enter an appointment date and time.' })
      .min(1, 'Enter an appointment date and time.')
      .refine(
        (value) =>
          value.length === 0 || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value),
        'Enter a valid appointment date and time.',
      ),
  ),
  status: z.enum(['booked', 'done', 'no_show'], {
    required_error: 'Select an appointment status.',
  }),
});

function parseAppointment(formData: FormData) {
  return AppointmentSchema.parse({
    patient_id: formData.get('patient_id'),
    starts_at: formData.get('starts_at'),
    status: formData.get('status'),
  });
}

export async function createAppointment(
  _prevState: EntityFormState,
  formData: FormData,
): Promise<EntityFormState> {
  const parsedAppointment = AppointmentSchema.safeParse({
    patient_id: formData.get('patient_id'),
    starts_at: formData.get('starts_at'),
    status: formData.get('status'),
  });
  if (!parsedAppointment.success) {
    return {
      errors: parsedAppointment.error.flatten().fieldErrors,
      message: 'Please complete the required appointment fields.',
    };
  }
  const appointment = parsedAppointment.data;
  const startsAt = fromDateTimeLocal(appointment.starts_at);
  const appointmentDate = new Date(startsAt);

  if (appointmentDate.getTime() <= Date.now()) {
    return {
      errors: { starts_at: ['Choose a future date and time.'] },
      message: 'Please choose a future appointment time.',
    };
  }

  const supabase = await createClient();
  const { user, clinicId } = await getCurrentClinic(supabase);

  const { data: patient, error: patientError } = await supabase
    .from('patients')
    .select('id')
    .eq('id', appointment.patient_id)
    .eq('clinic_id', clinicId)
    .maybeSingle();

  if (patientError) {
    console.error('Failed to verify appointment patient:', patientError.message);
    return { message: 'Could not verify the selected patient.' };
  }

  if (!patient) {
    return {
      errors: { patient_id: ['Select a patient from your clinic.'] },
      message: 'Please select a patient from your clinic.',
    };
  }

  const { error } = await supabase.from('appointments').insert({
    user_id: user.id,
    clinic_id: clinicId,
    patient_id: appointment.patient_id,
    starts_at: startsAt,
    status: appointment.status,
  });

  if (error) {
    console.error('Failed to create appointment:', error.message);
    return { message: 'Could not book the appointment. Please try again.' };
  }

  revalidatePath('/dashboard/appointments');
  revalidatePath('/dashboard');
  redirect('/dashboard/appointments');
}

export async function updateAppointment(
  id: string,
  formData: FormData,
) {
  const appointment = parseAppointment(formData);
  const startsAt = fromDateTimeLocal(appointment.starts_at);
  const supabase = await createClient();
  const { clinicId } = await getCurrentClinic(supabase);

  const { data: patient, error: patientError } = await supabase
    .from('patients')
    .select('id')
    .eq('id', appointment.patient_id)
    .eq('clinic_id', clinicId)
    .maybeSingle();

  if (patientError) {
    console.error('Failed to verify appointment patient:', patientError.message);
    throw new Error('Could not verify the selected patient.');
  }

  if (!patient) {
    throw new Error('Please select a patient from your clinic.');
  }

  const { data: updatedAppointment, error } = await supabase
    .from('appointments')
    .update({
      patient_id: appointment.patient_id,
      starts_at: startsAt,
      status: appointment.status,
    })
    .eq('id', id)
    .eq('clinic_id', clinicId)
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('Failed to update appointment:', error.message);
    throw new Error('Could not update the appointment. Please try again.');
  }

  if (!updatedAppointment) {
    throw new Error('Appointment not found or access denied.');
  }

  revalidatePath('/dashboard/appointments');
  revalidatePath(`/dashboard/appointments/${id}/edit`);
  revalidatePath('/dashboard');
  redirect('/dashboard/appointments');
}

export async function deleteAppointment(
  id: string,
): Promise<{ message: string | null }> {
  const supabase = await createClient();
  const { clinicId, role } = await getCurrentClinic(supabase);

  if (role !== 'owner') {
    return { message: 'Only the clinic owner can delete appointments.' };
  }

  const { data, error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id)
    .eq('clinic_id', clinicId)
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('Failed to delete appointment:', error.message);
    return { message: 'Could not delete the appointment. Please try again.' };
  }

  if (!data) {
    return {
      message: 'Appointment not found or you do not have permission to delete it.',
    };
  }

  revalidatePath('/dashboard/appointments');
  revalidatePath('/dashboard/tomorrow');
  revalidatePath('/dashboard');
  return { message: null };
}


export async function createTreatment(formData: FormData) {
  const appointmentId = String(
    formData.get('appointment_id') ?? '',
  ).trim();
  const procedure = String(
    formData.get('procedure') ?? '',
  ).trim();
  const feeInput = String(
    formData.get('fee') ?? '',
  ).trim();

  const fee = Number(feeInput);

  if (
    !appointmentId ||
    !procedure ||
    procedure.length > 200 ||
    !feeInput ||
    !Number.isFinite(fee) ||
    fee < 0 ||
    !/^\d+(\.\d{1,2})?$/.test(feeInput)
  ) {
    throw new Error(
      'Please provide a valid appointment, procedure, and fee.',
    );
  }

  const feeCents = Math.round(fee * 100);
  
const supabase = await createClient();
const { user, clinicId, role } = await getCurrentClinic(supabase);

if (role !== 'owner') {
  throw new Error('Only the clinic owner can record treatments.');
}

// Confirm the appointment belongs to this clinic.
const { data: appointment, error: appointmentError } = await supabase
  .from('appointments')
  .select('id')
  .eq('id', appointmentId)
  .eq('clinic_id', clinicId)
  .maybeSingle();

if (appointmentError || !appointment) {
  throw new Error('Please select a valid appointment.');
}

const { error } = await supabase.from('treatments').insert({
  user_id: user.id,
  clinic_id: clinicId,
  appointment_id: appointmentId,
  procedure,
  fee_cents: feeCents,
});

if (error) {
  console.error('Failed to create treatment:', error.message);
  throw new Error('Could not save the treatment. Please try again.');
}


  revalidatePath('/dashboard/treatments');
  redirect('/dashboard/treatments');
}




export async function deletePatient(id: string): Promise<{ message: string | null }> {
  const supabase = await createClient();

  const { data: appointments, error: appointmentError } = await supabase
    .from('appointments')
    .select('id')
    .eq('patient_id', id)
    .limit(1);

  if (appointmentError) {
    console.error('Failed to check patient appointments:', appointmentError.message);
    return { message: 'Could not check this patient’s appointments.' };
  }

  if (appointments && appointments.length > 0) {
    return {
      message: 'This patient has appointments. Delete or reassign those appointments first.',
    };
  }

  const { data, error } = await supabase
    .from('patients')
    .delete()
    .eq('id', id)
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('Failed to delete patient:', error.message);
    return { message: 'Could not delete the patient. Please try again.' };
  }

  if (!data) {
    return {
      message: 'Patient not found or you do not have permission to delete this record.',
    };
  }

  revalidatePath('/dashboard/patients');
  return { message: null };
}
