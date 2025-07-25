import type { Metadata } from 'next'
import { generateMeta } from '@/utilities/generateMeta'
import { getLocaleDirection, type Locale } from '@/utilities/locale'
import { getTranslation } from '@/utilities/translations'
import { notFound } from 'next/navigation'
import BackToTopButton from './BackToTopButton'

type Args = {
  params: Promise<{
    locale: string
  }>
}

export default async function OrganizationPage({ params: paramsPromise }: Args) {
  const { locale } = await paramsPromise
  
  if (locale !== 'fr' && locale !== 'ar') {
    notFound()
  }
  
  const direction = getLocaleDirection(locale as Locale)
  
  const organizationData = {
    fr: {
      title: getTranslation('organization', 'fr'),
      subtitle: getTranslation('organizationStructure', 'fr'),
      intro: getTranslation('legalFrameworkTitle', 'fr'),
      
      governingCouncil: {
        title: getTranslation('councilAuthority', 'fr'),
        description: "L'Autorité Supérieure est dirigée par un organe délibérant appelé le Conseil de l'Autorité Supérieure."
      },
      
      composition: {
        title: getTranslation('councilComposition', 'fr'),
        description: "Le Conseil de l'Autorité Supérieure se compose de neuf (9) membres, nommés par décret du Président de la République selon la répartition suivante :",
        members: [
          {
            count: "4 membres",
            description: "nommés par le Président de la République, dont le président de l'Autorité",
            icon: "president"
          },
          {
            count: "3 membres",
            description: "proposés par le Président de l'Assemblée Nationale, dont au moins un représentant des partis d'opposition",
            icon: "parliament"
          },
          {
            count: "2 membres",
            description: "proposés par les organismes professionnels de presse",
            icon: "press"
          }
        ]
      },
      
      qualifications: {
        title: getTranslation('requiredQualifications', 'fr'),
        description: "Les membres doivent répondre aux critères suivants :",
        criteria: [
          "Diplôme universitaire (Bac + 3 minimum) en communication ou domaine connexe",
          "Expérience de 5 ans minimum dans le secteur",
          "Moralité irréprochable et compétences avérées",
          "Engagement reconnu pour le développement des médias nationaux"
        ]
      },
      
      mandate: {
        title: getTranslation('mandateDuration', 'fr'),
        president: "Le Président : mandat de 4 ans, renouvelable une fois",
        members: "Les membres : mandat de 4 ans, non renouvelable",
        replacement: "En cas de remplacement, le nouveau membre termine le mandat de son prédécesseur"
      },
      
      oath: {
        title: getTranslation('investmentOath', 'fr'),
        description: "Avant d'entrer en fonction, les membres prêtent serment devant la Cour Suprême :",
        text: "« Je jure devant Dieu Tout-Puissant d'accomplir ma mission en toute loyauté et de l'exercer avec détachement, impartialité et intégrité conformément à la constitution et aux lois de la République Islamique de Mauritanie, et de préserver le secret des délibérations même après la fin de mes fonctions. »"
      },
      
      functioning: {
        title: getTranslation('councilFunctioning', 'fr'),
        meetings: "Réunions mensuelles ordinaires sur convocation du président ou des deux tiers des membres",
        quorum: "Quorum de 6 membres minimum pour délibérer",
        decisions: "Décisions à la majorité simple, voix prépondérante du président en cas d'égalité"
      },
      
      confidentiality: {
        title: getTranslation('confidentialityEthics', 'fr'),
        description: "Les membres sont tenus au secret professionnel pendant et après leur mandat concernant les faits, actes et informations dont ils ont eu connaissance dans l'exercice de leurs fonctions."
      },
      
      backToTop: getTranslation('backToTop', 'fr')
    },
    ar: {
      title: getTranslation('organization', 'ar'),
      subtitle: getTranslation('organizationStructure', 'ar'),
      intro: getTranslation('legalFrameworkTitle', 'ar'),
      
      governingCouncil: {
        title: getTranslation('councilAuthority', 'ar'),
        description: "يدير السلطة العليا جهاز للمداولة يدعى مجلس السلطة العليا."
      },
      
      composition: {
        title: getTranslation('councilComposition', 'ar'),
        description: "يتكون مجلس السلطة العليا للصحافة والسمعيات البصرية من تسعة (9) أعضاء، يتم تعيينهم بمرسوم صادر عن رئيس الجمهورية على النحو التالي:",
        members: [
          {
            count: "4 أعضاء",
            description: "يعينهم رئيس الجمهورية من بينهم رئيس السلطة",
            icon: "president"
          },
          {
            count: "3 أعضاء",
            description: "يقترحهم رئيس الجمعية الوطنية من بينهم واحد على الأقل يمثل أحزاب المعارضة الممثلة بالبرلمان",
            icon: "parliament"
          },
          {
            count: "عضوان",
            description: "تقترحهما الهيئات الصحفية المهنية، وفي حالة تعذر التوافق يقترح الوزير المكلف بالاتصال بديلا",
            icon: "press"
          }
        ]
      },
      
      qualifications: {
        title: getTranslation('requiredQualifications', 'ar'),
        description: "يتم اختيار رئيس وأعضاء السلطة العليا وفقًا للمعايير التالية:",
        criteria: [
          "الحصول على باكلوريا + 3 سنوات على الأقل في تخصص الإعلام أو إحدى التخصصات ذات الصلة",
          "خبرة 5 سنوات في المجال",
          "من ذوي الأخلاق الحميدة والكفاءات الأكيدة",
          "المعروفين بالاهتمام الذي يولونه لتطوير وتنمية قطاع الصحافة الوطنية"
        ]
      },
      
      mandate: {
        title: getTranslation('mandateDuration', 'ar'),
        president: "الرئيس: فترة انتداب مدتها 4 سنوات قابلة للتجديد مرة واحدة",
        members: "الأعضاء: فترة انتداب مدتها 4 سنوات غير قابلة للتجديد",
        replacement: "يكمل الأعضاء المعينون في محل الأعضاء المنتهية عضويتهم فترة انتداب من يحلون محلهم"
      },
      
      oath: {
        title: getTranslation('investmentOath', 'ar'),
        description: "يؤدي رئيس وأعضاء السلطة العليا، قبل توليهم مهامهم القسم التالي أمام المحكمة العليا:",
        text: "«أقسم بالله العلي العظيم أن أؤدي مهمتي بكل أمانة وأن أمارسها بكل تجرد وحياد ونزاهة وفق دستور وقوانين الجمهورية الإسلامية الموريتانية، وأن أحافظ على سرية المداولات حتى بعد انتهاء مهاميَ»"
      },
      
      functioning: {
        title: getTranslation('councilFunctioning', 'ar'),
        meetings: "يجتمع مجلس السلطة العليا في دورة عادية كل شهر على الأقل بدعوة من رئيسه أو ثلثي أعضائه",
        quorum: "لا يمكنه التداول إلا بحضور ستة (6) من أعضائه على الأقل",
        decisions: "يتخذ القرارات بالأغلبية البسيطة للأعضاء الحاضرين ويكون صوت الرئيس مرجحا في حالة تعادل الأصوات"
      },
      
      confidentiality: {
        title: getTranslation('confidentialityEthics', 'ar'),
        description: "يلزم أعضاء السلطة العليا والأمين العام بالحفاظ على السرية المهنية بمناسبة مزاولة وظائفهم وبعد نهاية مأموريتهم فيما يخص الوقائع والأفعال والمعلومات التي اطلعوا عليها لدى السلطة العليا."
      },
      
      backToTop: getTranslation('backToTop', 'ar')
    }
  }
  
  const content = organizationData[locale as keyof typeof organizationData]
  
  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'president':
        return (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L13.09 8.26L22 9L13.09 15.74L12 22L10.91 15.74L2 9L10.91 8.26L12 2Z"/>
          </svg>
        )
      case 'parliament':
        return (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L3.09 8.26L4 21H20L20.91 8.26L12 2ZM18.5 19H5.5L4.84 9.24L12 4.5L19.16 9.24L18.5 19Z"/>
          </svg>
        )
      case 'press':
        return (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 6H2V20C2 21.1 2.9 22 4 22H18V20H4V6ZM20 2H8C6.9 2 6 2.9 6 4V16C6 17.1 6.9 18 8 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H8V4H20V16ZM10 9H18V11H10V9ZM10 12H16V14H10V12ZM10 6H18V8H10V6Z"/>
          </svg>
        )
      default:
        return null
    }
  }
  
  return (
    <article className="min-h-screen pb-24" dir={direction}>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-accent via-primary to-accent text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-1/4 w-40 h-40 border border-white rounded-full"></div>
          <div className="absolute bottom-20 right-1/4 w-32 h-32 border border-secondary rounded-full"></div>
          <div className="absolute top-1/2 left-10 w-20 h-20 bg-secondary/30 rounded-full blur-xl"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-white/20 rounded-full blur-xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                {content.title}
              </h1>
              <div className="w-32 h-1 bg-secondary mx-auto"></div>
              <p className="text-xl md:text-2xl text-white/90 font-light max-w-4xl mx-auto leading-relaxed">
                {content.subtitle}
              </p>
            </div>
            
            {/* Organization Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-28 h-28 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <svg className="w-14 h-14 text-secondary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 4C16.55 4 17 4.45 17 5V7H20C20.55 7 21 7.45 21 8V19C21 19.55 20.55 20 20 20H4C3.45 20 3 19.55 3 19V8C3 7.45 3.45 7 4 7H7V5C7 4.45 7.45 4 8 4H16ZM15 6H9V7H15V6ZM5 9V18H19V9H5ZM7 11H9V13H7V11ZM11 11H13V13H11V11ZM15 11H17V13H15V11ZM7 15H9V17H7V15ZM11 15H13V17H11V15ZM15 15H17V17H15V15Z"/>
                  </svg>
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-secondary rounded-full animate-pulse flex items-center justify-center">
                  <span className="text-primary text-sm font-bold">9</span>
                </div>
              </div>
            </div>
            
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              {content.intro}
            </p>
          </div>
        </div>
        
      </section>

      {/* Governing Council Section */}
      <section className="relative bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              {content.governingCouncil.title}
            </h2>
            <div className="w-24 h-1 bg-primary mx-auto"></div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {content.governingCouncil.description}
            </p>
          </div>
        </div>
      </section>

      {/* Composition Section */}
      <section className="relative bg-gray-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            <div className="text-center space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                {content.composition.title}
              </h2>
              <div className="w-24 h-1 bg-primary mx-auto"></div>
              <p className="text-lg text-gray-600 max-w-4xl mx-auto">
                {content.composition.description}
              </p>
            </div>
            
            {/* Members Grid */}
            <div className="grid md:grid-cols-3 gap-8">
              {content.composition.members.map((member, index) => (
                <div
                  key={index}
                  className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary/20 text-center"
                >
                  <div className="space-y-6">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center group-hover:bg-accent transition-colors duration-300">
                        {getIcon(member.icon)}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-primary">
                        {member.count}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {member.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Qualifications Section */}
      <section className="relative bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  {content.qualifications.title}
                </h2>
                <div className="w-20 h-1 bg-primary"></div>
                <p className="text-lg text-gray-600">
                  {content.qualifications.description}
                </p>
              </div>
              
              <div className="space-y-4">
                {content.qualifications.criteria.map((criterion, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-1">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"/>
                      </svg>
                    </div>
                    <p className="text-gray-700 leading-relaxed flex-1">
                      {criterion}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Visual Element */}
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary/5 to-accent/10 rounded-2xl p-8 flex items-center justify-center">
                <div className="text-center space-y-6">
                  <div className="w-32 h-32 bg-primary rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.9 1 3 1.9 3 3V21C3 22.1 3.9 23 5 23H19C20.1 23 21 22.1 21 21V9H21ZM19 21H5V3H13V9H19V21Z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-primary">
                      {getTranslation('professionalQualifications', locale as Locale)}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mandate & Oath Section */}
      <section className="relative bg-gray-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Mandate */}
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100">
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  {content.mandate.title}
                </h2>
                <div className="w-20 h-1 bg-primary mx-auto"></div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L13.09 8.26L22 9L13.09 15.74L12 22L10.91 15.74L2 9L10.91 8.26L12 2Z"/>
                      </svg>
                    </div>
                    <p className="text-gray-700 font-medium">
                      {content.mandate.president}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16 4C16.55 4 17 4.45 17 5V7H20C20.55 7 21 7.45 21 8V19C21 19.55 20.55 20 20 20H4C3.45 20 3 19.55 3 19V8C3 7.45 3.45 7 4 7H7V5C7 4.45 7.45 4 8 4H16Z"/>
                      </svg>
                    </div>
                    <p className="text-gray-700 font-medium">
                      {content.mandate.members}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-200">
                <p className="text-gray-600 text-center">
                  {content.mandate.replacement}
                </p>
              </div>
            </div>
          </div>

          {/* Oath */}
          <div className="bg-primary text-white rounded-2xl p-8 md:p-12">
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold">
                  {content.oath.title}
                </h2>
                <div className="w-20 h-1 bg-secondary mx-auto"></div>
                <p className="text-white/90 text-lg">
                  {content.oath.description}
                </p>
              </div>
              
              <div className="bg-white/10 rounded-xl p-8 backdrop-blur-sm border border-white/20">
                <p className="text-white leading-relaxed text-center italic text-lg">
                  {content.oath.text}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Functioning & Confidentiality */}
      <section className="relative bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Functioning */}
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                {content.functioning.title}
              </h2>
              <div className="w-20 h-1 bg-primary mx-auto"></div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2A10 10 0 0 0 2 12A10 10 0 0 0 12 22A10 10 0 0 0 22 12A10 10 0 0 0 12 2M16.2 16.2L11 13V7H12.5V12.2L17 14.9L16.2 16.2Z"/>
                  </svg>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {content.functioning.meetings}
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 4C16.55 4 17 4.45 17 5V7H20C20.55 7 21 7.45 21 8V19C21 19.55 20.55 20 20 20H4C3.45 20 3 19.55 3 19V8C3 7.45 3.45 7 4 7H7V5C7 4.45 7.45 4 8 4H16ZM15 6H9V7H15V6ZM5 9V18H19V9H5ZM7 11H9V13H7V11ZM11 11H13V13H11V11ZM15 11H17V13H15V11Z"/>
                  </svg>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {content.functioning.quorum}
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V4C20 2.9 19.1 2 18 2ZM18 20H6V4H18V20ZM8 6H16V8H8V6ZM8 10H16V12H8V10ZM8 14H16V16H8V14Z"/>
                  </svg>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {content.functioning.decisions}
                </p>
              </div>
            </div>
          </div>

          {/* Confidentiality */}
          <div className="bg-gray-900 text-white rounded-2xl p-8 md:p-12">
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold">
                  {content.confidentiality.title}
                </h2>
                <div className="w-20 h-1 bg-secondary mx-auto"></div>
              </div>
              
              <div className="max-w-4xl mx-auto">
                <p className="text-white/90 leading-relaxed text-lg">
                  {content.confidentiality.description}
                </p>
              </div>
              
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-secondary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Back to Top Button */}
      <BackToTopButton label={content.backToTop} />
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { locale } = await paramsPromise
  
  const titles = {
    fr: "Organisation - Structure de l'Autorité Supérieure HAPA",
    ar: "التنظيم والأعضاء - هيكل السلطة العليا للصحافة والسمعيات البصرية"
  }
  
  const descriptions = {
    fr: "Découvrez la structure organisationnelle, la composition du conseil et le fonctionnement de la Haute Autorité de la Presse et de l'Audiovisuel de Mauritanie.",
    ar: "تعرف على الهيكل التنظيمي وتشكيلة المجلس وسير عمل السلطة العليا للصحافة والسمعيات البصرية في موريتانيا."
  }
  
  return generateMeta({
    doc: {
      meta: {
        title: titles[locale as keyof typeof titles] || titles.fr,
        description: descriptions[locale as keyof typeof descriptions] || descriptions.fr,
      }
    }
  })
}

export async function generateStaticParams() {
  return [
    { locale: 'fr' },
    { locale: 'ar' }
  ]
}