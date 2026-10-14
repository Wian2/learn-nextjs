import postgres from 'postgres';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  Revenue,
} from './definitions';
import { formatCurrency } from './utils';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function fetchRevenue() {
  try {
    // Artificially delay a response for demo purposes.
    // Don't do this in production :)

    console.log('Fetching revenue data...');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const data = await sql<Revenue[]>`SELECT * FROM revenue`;

    console.log('Data fetch completed after 3 seconds.');

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices() {
  try {
    const data = await sql<LatestInvoiceRaw[]>`
      SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      ORDER BY invoices.date DESC
      LIMIT 5`;

    const latestInvoices = data.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
    const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
    const invoiceStatusPromise = sql`SELECT
          SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
          SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
          FROM invoices`;

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = Number(data[0][0].count ?? '0');
    const numberOfCustomers = Number(data[1][0].count ?? '0');
    const totalPaidInvoices = formatCurrency(data[2][0].paid ?? '0');
    const totalPendingInvoices = formatCurrency(data[2][0].pending ?? '0');

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await sql<InvoicesTable[]>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
      ORDER BY invoices.date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return invoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    const data = await sql`SELECT COUNT(*)
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE
      customers.name ILIKE ${`%${query}%`} OR
      customers.email ILIKE ${`%${query}%`} OR
      invoices.amount::text ILIKE ${`%${query}%`} OR
      invoices.date::text ILIKE ${`%${query}%`} OR
      invoices.status ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const data = await sql<InvoiceForm[]>`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status
      FROM invoices
      WHERE invoices.id = ${id};
    `;

    const invoice = data.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));

    console.log(invoice); // Invoice is an empty array []

    return invoice[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomers() {
  try {
    const customers = await sql<CustomerField[]>`
      SELECT
        id,
        name
      FROM customers
      ORDER BY name ASC
    `;

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    const data = await sql<CustomersTableType[]>`
		SELECT
		  customers.id,
		  customers.name,
		  customers.email,
		  customers.image_url,
		  COUNT(invoices.id) AS total_invoices,
		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
		  SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
		FROM customers
		LEFT JOIN invoices ON customers.id = invoices.customer_id
		WHERE
		  customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
		GROUP BY customers.id, customers.name, customers.email, customers.image_url
		ORDER BY customers.name ASC
	  `;

    const customers = data.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}

export type Patient = {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  date_of_birth: string | null;
  created_at: string;
};

export async function fetchPatients(): Promise<Patient[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('patients')
    .select('id, user_id, full_name, phone, date_of_birth, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase error:', error);
    throw new Error('Failed to fetch patients.');
  }

  return data as Patient[];
}

export async function fetchPatientById(id: string): Promise<Patient | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('patients')
    .select('id, user_id, full_name, phone, date_of_birth, created_at')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Supabase error:', error);
    throw new Error('Failed to fetch patient.');
  }

  return (data as Patient | null) ?? null;
}


export type Treatment = {
  id: string;
  user_id: string;
  appointment_id: string;
  procedure: string;
  fee_cents: number;
  created_at: string;
};


export async function fetchTreatments() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('treatments')
    .select(`
      id,
      user_id,
      appointment_id,
      procedure,
      fee_cents,
      created_at,
      appointments (
        starts_at,
        status,
        patients (
          full_name
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch treatments:', error.message);
    throw new Error('Failed to fetch treatments.');
  }

  return data;
}


export async function fetchClinicCardData() {
  const supabase = await createClient();

  const [
    { count: patientCount, error: patientError },
    { count: appointmentCount, error: appointmentError },
    { count: treatmentCount, error: treatmentError },
  ] = await Promise.all([
    supabase
      .from('patients')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('treatments')
      .select('*', { count: 'exact', head: true }),
  ]);

  if (patientError || appointmentError || treatmentError) {
    console.error('Clinic card data error:', {
      patientError,
      appointmentError,
      treatmentError,
    });
    throw new Error('Failed to fetch clinic card data.');
  }

  return {
    numberOfPatients: patientCount ?? 0,
    numberOfAppointments: appointmentCount ?? 0,
    numberOfTreatments: treatmentCount ?? 0,
  };
}


export async function fetchPatientRegistrations() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('patients_per_month')
    .select('month_start, label, new_patients')
    .order('month_start', { ascending: true });

  if (error) {
    console.error(
      'Failed to fetch patient registrations:',
      error.message,
    );
    throw new Error('Failed to fetch patient registrations.');
  }

  return data ?? [];
}

export type AppointmentStatus = 'booked' | 'done' | 'no_show';
export type MonthlyAppointmentStatusCount = {
  status: AppointmentStatus;
  count: number;
};

function isAppointmentStatus(value: unknown): value is AppointmentStatus {
  return value === 'booked' || value === 'done' || value === 'no_show';
}

export type AppointmentRow = {
  id: string;
  starts_at: string;
  status: AppointmentStatus;
  patients:
    | { full_name: string; phone: string | null }
    | { full_name: string; phone: string | null }[]
    | null;
};

export type PatientOption = {
  id: string;
  full_name: string;
};

export async function fetchAppointments(): Promise<AppointmentRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      id,
      starts_at,
      status,
      patients (
        full_name,
        phone
      )
    `)
    .order('starts_at', { ascending: true });

  if (error) {
    console.error('Failed to fetch appointments:', error.message);
    throw new Error('Failed to fetch appointments.');
  }

  return (data ?? []) as AppointmentRow[];
}

export async function fetchMonthlyAppointmentStatuses(): Promise<{
  monthLabel: string;
  total: number;
  statuses: MonthlyAppointmentStatusCount[];
}> {
  const now = new Date();
  const monthParts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Johannesburg',
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(now);
  const parts = Object.fromEntries(
    monthParts.map(({ type, value }) => [type, value]),
  );
  const year = Number(parts.year);
  const month = Number(parts.month);
  const nextMonthDate = new Date(Date.UTC(year, month, 1));
  const nextYear = nextMonthDate.getUTCFullYear();
  const nextMonth = String(nextMonthDate.getUTCMonth() + 1).padStart(2, '0');
  const startAt = `${year}-${String(month).padStart(2, '0')}-01T00:00:00+02:00`;
  const endAt = `${nextYear}-${nextMonth}-01T00:00:00+02:00`;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('appointments')
    .select('status, patients!inner(id)')
    .gte('starts_at', startAt)
    .lt('starts_at', endAt);

  if (error) {
    console.error('Failed to fetch monthly appointment statuses:', error.message);
    throw new Error('Failed to fetch monthly appointment statuses.');
  }

  const counts: Record<AppointmentStatus, number> = {
    booked: 0,
    done: 0,
    no_show: 0,
  };

  for (const appointment of data ?? []) {
    const status: unknown = appointment.status;
    if (!isAppointmentStatus(status)) {
      throw new Error(`Unexpected appointment status: ${String(status)}`);
    }
    counts[status] += 1;
  }

  return {
    monthLabel: new Intl.DateTimeFormat('en-ZA', {
      timeZone: 'Africa/Johannesburg',
      month: 'long',
      year: 'numeric',
    }).format(new Date(startAt)),
    total: Object.values(counts).reduce((sum, count) => sum + count, 0),
    statuses: (Object.entries(counts) as [AppointmentStatus, number][]).map(
      ([status, count]) => ({ status, count }),
    ),
  };
}

export async function fetchPatientOptions(): Promise<PatientOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('patients')
    .select('id, full_name')
    .order('full_name', { ascending: true });

  if (error) {
    console.error('Failed to fetch patient options:', error.message);
    throw new Error('Failed to fetch patient options.');
  }

  return data ?? [];
}

export async function fetchAppointmentById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('appointments')
    .select('id, patient_id, starts_at, status')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Failed to fetch appointment:', error.message);
    throw new Error('Failed to fetch appointment.');
  }

  return data;
}

export async function fetchCurrentClinicRole(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error('Failed to identify current user:', userError.message);
    throw new Error('Failed to identify current user.');
  }

  if (!user) {
    redirect('/login');
  }

  const { data: membership, error } = await supabase
    .from('clinic_members')
    .select('role')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Failed to fetch clinic role:', error.message);
    throw new Error('Failed to fetch clinic role.');
  }

  if (!membership) {
    throw new Error('Your account is not assigned to a clinic.');
  }

  return membership.role;
}