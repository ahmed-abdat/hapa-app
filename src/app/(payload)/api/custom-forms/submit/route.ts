import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { formSchemas, FormType } from '@/components/CustomForms/schemas/index'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const body = await request.json()

    // Validate form type
    const formType = body.formType as FormType
    if (!formType || !formSchemas[formType]) {
      return NextResponse.json(
        { success: false, message: 'Type de formulaire invalide' },
        { status: 400 }
      )
    }

    // Validate form data using appropriate Zod schema
    const schema = formSchemas[formType]
    const validationResult = schema.safeParse(body)

    if (!validationResult.success) {
      const errors = validationResult.error.issues.reduce((acc, error) => {
        const field = error.path.join('.')
        if (!acc[field]) acc[field] = []
        acc[field].push(error.message)
        return acc
      }, {} as Record<string, string[]>)

      return NextResponse.json(
        { 
          success: false, 
          message: 'Données de formulaire invalides',
          errors 
        },
        { status: 400 }
      )
    }

    // Get additional metadata
    const userAgent = request.headers.get('user-agent') || undefined
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ipAddress = forwardedFor 
      ? forwardedFor.split(',')[0].trim()
      : request.headers.get('x-real-ip') || 'unknown'

    // Create form submission in Payload
    const submission = await payload.create({
      collection: 'custom-form-submissions',
      data: {
        formType,
        submissionData: validationResult.data,
        status: 'new',
        locale: validationResult.data.locale,
        userAgent,
        ipAddress,
      },
    })

    // Email notifications can be added here in the future
    // Example: await sendNotificationEmail(validationResult.data, submission.id)

    return NextResponse.json({
      success: true,
      message: validationResult.data.locale === 'fr' 
        ? 'Votre formulaire a été soumis avec succès'
        : 'تم إرسال النموذج بنجاح',
      submissionId: submission.id,
    })

  } catch (error) {
    console.error('Form submission error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erreur interne du serveur. Veuillez réessayer plus tard.' 
      },
      { status: 500 }
    )
  }
}