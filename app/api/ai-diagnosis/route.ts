import Together from 'together-ai';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { systemPrompt } from './utils';
import { calculateAge } from '@/lib/utils';  

export async function POST(request: Request) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const {
      data: {user} 
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const { patientId, symptoms, medicalHistory } = await request.json();

    if (!patientId || !symptoms) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch patient data
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single();

    if (patientError || !patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Fetch patient's medical records
    const { data: medicalRecords, error: recordsError } = await supabase
      .from('medical_records')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (recordsError) {
      return NextResponse.json(
        { error: 'Error fetching medical records' },
        { status: 500 }
      );
    }

    // Prepare patient data for AI
    const patientData = {
      age: calculateAge(patient.date_of_birth),
      gender: patient.gender,
      medicalHistory: medicalHistory || 'No medical history provided',
      recentRecords: medicalRecords.map((record) => ({
        type: record.record_type,
        diagnosis: record.diagnosis,
        date: record.created_at,
      })),
    };

    

    // Initialize Together.ai client
    const together = new Together();

    // Generate AI diagnosis suggestions
    const response = await together.chat.completions.create({
      model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `
              Patient Information:
              - Age: ${patientData.age}
              - Gender: ${patientData.gender}
              - Medical History: ${patientData.medicalHistory}
              
              Recent Medical Records:
              ${patientData.recentRecords
                .map(
                  (record) =>
                    `- ${record.type} (${new Date(
                      record.date
                    ).toLocaleDateString()}): ${
                      record.diagnosis || 'No diagnosis recorded'
                    }`
                )
                .join('\n')}
              
              Current Symptoms:
              ${symptoms}
              
              Based on this information, what are the potential diagnoses to consider? 
              Please provide a list of possible conditions, their likelihood, recommended tests, 
              and any immediate actions that should be considered.
            `,
        },

      ],
    });

    const text = response.choices?.[0]?.message?.content || '';

    // Log the AI interaction
    await supabase.from('ai_diagnosis_logs').insert({
      patient_id: patientId,
      user_id: user.id,
      symptoms,
      ai_response: text,
    });

    return NextResponse.json({ suggestions: text });
  } catch (error: any) {
    console.error('AI diagnosis error:', error);

    return NextResponse.json(
      { error: error.message || 'An error occurred during AI diagnosis' },
      { status: 500 }
    );
  }
}

