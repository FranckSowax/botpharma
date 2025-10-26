import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export async function GET() {
  try {
    const supabase = createClient()

    // Tester la connexion Supabase
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('*')
      .limit(1)

    if (testError) {
      return NextResponse.json({
        success: false,
        error: 'Erreur de connexion à Supabase',
        details: {
          code: testError.code,
          message: testError.message,
          details: testError.details,
          hint: testError.hint,
        },
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      })
    }

    // Essayer de créer un utilisateur de test
    const testPhone = `test_${Date.now()}@test.com`
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        phone_number: testPhone,
        name: 'Test User',
        role: 'customer',
        profile_data: {},
      })
      .select()
      .single()

    if (createError) {
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la création d\'un utilisateur de test',
        details: {
          code: createError.code,
          message: createError.message,
          details: createError.details,
          hint: createError.hint,
        },
        tableAccessible: true,
        testData: testData,
      })
    }

    // Supprimer l'utilisateur de test
    await supabase
      .from('users')
      .delete()
      .eq('phone_number', testPhone)

    return NextResponse.json({
      success: true,
      message: 'Supabase fonctionne correctement',
      tableAccessible: true,
      canCreateUsers: true,
      existingUsersCount: testData?.length || 0,
      testUserCreated: newUser,
    })
  } catch (error: any) {
    console.error('Erreur test Supabase:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur serveur',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
