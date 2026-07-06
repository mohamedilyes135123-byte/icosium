import { createClient } from "@/lib/supabase/client";

// ── Types ─────────────────────────────────────────────────────────

export interface MedicationReminder {
  id: string;
  patient_id: string;
  name: string;
  dose: string | null;
  frequency: string | null;
  times: string[];
  is_active: boolean;
  notes: string | null;
  created_at: string;
  source_prescription_id?: string;
  doctor_name?: string;
  duration?: string;
  auto_created?: boolean;
}

export interface PrescriptionWithPayment {
  id: string;
  is_paid: boolean;
  status: string;
  medications: Array<{ name: string; dose: string; frequency: string; duration?: string; notes?: string }>;
  doctor_notes: string | null;
  qr_token: string | null;
  created_at: string;
  doctor?: { full_name: string } | null;
}

// ── Prescription Actions ──────────────────────────────────────────

/**
 * Fetches all prescriptions for a patient, including payment status.
 */
export async function fetchPrescriptions(patientId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("prescriptions")
    .select(`
      id, is_paid, status, medications, doctor_notes, qr_token, created_at,
      doctor:profiles!prescriptions_doctor_id_fkey(full_name)
    `)
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []) as unknown as PrescriptionWithPayment[];
}

/**
 * Mock-unlocks a prescription by setting is_paid = true.
 * In production, replace with a webhook handler.
 */
export async function unlockPrescription(prescriptionId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("prescriptions")
    .update({ is_paid: true, status: "active" })
    .eq("id", prescriptionId);
  if (error) throw new Error(error.message);
}

// ── Payment Actions ───────────────────────────────────────────────

/**
 * Fetches the active payment plan for a given role.
 */
export async function fetchActivePaymentPlan(targetRole: string = "patient") {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("payment_plans")
    .select("*")
    .eq("target_role", targetRole)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  if (error && error.code !== "PGRST116") throw new Error(error.message);
  return data;
}

/**
 * Creates a trial payment transaction.
 */
export async function createTrialPaymentTransaction(
  patientId: string,
  prescriptionId: string,
  amount: number,
  paymentCode: string
) {
  const supabase = createClient();
  const { error } = await supabase.from("payment_transactions").insert([{
    patient_id: patientId,
    prescription_id: prescriptionId,
    amount,
    payment_code: paymentCode,
    status: "approved",
    is_trial: true,
  }]);
  if (error) throw new Error(error.message);
}

/**
 * Archives a prescription (called on back navigation from detail view).
 */
export async function archivePrescription(prescriptionId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("prescriptions")
    .update({ status: "archived" })
    .eq("id", prescriptionId);
  if (error) throw new Error(error.message);
}

/**
 * Sends a prescription to a chosen pharmacy (creates pharmacy_order).
 */
export async function sendPrescriptionToPharmacy(
  prescriptionId: string,
  pharmacyId: string,
  patientId: string
) {
  const supabase = createClient();
  // Create the pharmacy order
  const { error: orderError } = await supabase
    .from("pharmacy_orders")
    .insert([{ prescription_id: prescriptionId, patient_id: patientId, pharmacy_id: pharmacyId }]);
  if (orderError) {
    console.error("sendPrescriptionToPharmacy Insert Error:", orderError);
    throw new Error(orderError.message);
  }

  // Mark prescription as used
  const { error: rxError } = await supabase
    .from("prescriptions")
    .update({ is_used: true, sent_to_pharmacy_id: pharmacyId })
    .eq("id", prescriptionId);
  if (rxError) {
    console.error("sendPrescriptionToPharmacy Update Error:", rxError);
    throw new Error(rxError.message);
  }
}

/**
 * Assigns a lab to a lab request (routes it to chosen lab).
 */
export async function sendLabRequestToLab(labReqId: string, labId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("lab_requests")
    .update({ lab_id: labId })
    .eq("id", labReqId)
    .select();
  if (error) {
    console.error("sendLabRequestToLab error:", error);
    throw new Error(error.message);
  }
  if (!data || data.length === 0) {
    console.error("sendLabRequestToLab failed: No rows updated. Possibly RLS or invalid labReqId:", labReqId);
    throw new Error("لم يتم تحديث أي بيانات. يرجى التحقق من الصلاحيات (RLS) أو المعرف.");
  }
}

// ── Medication Reminder Actions ───────────────────────────────────

/**
 * Auto-creates medication reminders from a prescription's medications array.
 */
export async function autoCreateRemindersFromPrescription(
  prescriptionId: string,
  patientId: string,
  medications: Array<{ name: string; dose: string; frequency: string; duration?: string; notes?: string }>,
  doctorName?: string
) {
  if (!medications || medications.length === 0) return;

  const supabase = createClient();

  // Simple heuristic for default times based on frequency string
  const getTimesForFrequency = (freq: string): string[] => {
    const lFreq = freq.toLowerCase();
    if (lFreq.includes("2") || lFreq.includes("مرتين")) return ["08:00", "20:00"];
    if (lFreq.includes("3") || lFreq.includes("ثلاث")) return ["08:00", "14:00", "20:00"];
    if (lFreq.includes("4") || lFreq.includes("أربع")) return ["08:00", "12:00", "16:00", "20:00"];
    return ["08:00"]; // Default to once daily morning
  };

  const reminders = medications.map(med => ({
    patient_id: patientId,
    source_prescription_id: prescriptionId,
    name: med.name,
    dose: med.dose,
    frequency: med.frequency,
    duration: med.duration,
    times: getTimesForFrequency(med.frequency),
    notes: med.notes || null,
    doctor_name: doctorName || "الطبيب",
    auto_created: true,
    is_active: true
  }));

  const { error } = await supabase.from("medication_reminders").insert(reminders);
  if (error) {
    console.error("Failed to auto-create reminders:", error);
    // Non-fatal, just log it.
  }
}

/**
 * Fetches all medication reminders for a patient.
 */
export async function fetchMedicationReminders(patientId: string): Promise<MedicationReminder[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("medication_reminders")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []) as MedicationReminder[];
}

/**
 * Adds a new medication reminder.
 */
export async function addMedicationReminder(
  patientId: string,
  reminder: { name: string; dose: string; frequency: string; times: string[]; notes?: string }
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("medication_reminders")
    .insert([{ patient_id: patientId, ...reminder }])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as MedicationReminder;
}

/**
 * Toggles the active state of a medication reminder.
 */
export async function toggleMedicationReminder(id: string, isActive: boolean) {
  const supabase = createClient();
  const { error } = await supabase
    .from("medication_reminders")
    .update({ is_active: isActive })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

/**
 * Deletes a medication reminder.
 */
export async function deleteMedicationReminder(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("medication_reminders")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}

// ── Lab File Upload ───────────────────────────────────────────────

/**
 * Uploads a lab file to Supabase Storage bucket "lab-uploads".
 * Returns the public URL of the uploaded file.
 */
export async function uploadLabFile(userId: string, file: File): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("medical-docs")
    .upload(path, file, { upsert: true });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("medical-docs").getPublicUrl(path);
  return data.publicUrl;
}
