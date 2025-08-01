import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { generateMeta } from '@/utilities/generateMeta'
import { type Locale } from '@/utilities/locale'
import { notFound } from 'next/navigation'
import BackToTopButton from './BackToTopButton'

type Args = {
  params: Promise<{
    locale: string
  }>
}

export default async function MissionPage({ params: paramsPromise }: Args) {
  const { locale } = await paramsPromise
  
  if (locale !== 'fr' && locale !== 'ar') {
    notFound()
  }
  
  const t = await getTranslations()
  
  const missionData = {
    fr: {
      title: "Mission HAPA",
      subtitle: "Notre Mission et Vision",
      aboutUs: t('hapaAbout'),
      aboutContent: `La Haute Autorité de la Presse et de l'Audiovisuel a été créée en vertu de l'ordonnance n° 034-2006 du 20 octobre 2006.

Il s'agit d'une institution indépendante chargée de la régulation et du développement du paysage médiatique national, dans le but de promouvoir les valeurs du travail journalistique professionnel, sur la base d'un code juridique solide et d'un cadre législatif clair, cherchant à sécuriser et renforcer la liberté d'expression et à en faire un acquis national et un choix stratégique fondamental constituant un pilier central de la pratique démocratique.

La Haute Autorité de la Presse et de l'Audiovisuel est l'organisme responsable de la régulation et du contrôle du secteur de la communication en veillant à l'application des législations et règlements relatifs à la presse, à la communication audiovisuelle et aux médias numériques.`,
      missionsTitle: t('missionAndResponsibilities'),
      missions: [
        "Veiller à l'application de la législation et des règlements relatifs à la presse et à la communication audiovisuelle et aux médias numériques dans des conditions non discriminatoires garantissant l'équité, l'objectivité et la transparence",
        "Contribuer à garantir le respect de l'éthique professionnelle par les entreprises et institutions de radiodiffusion privées, publiques et associatives",
        "Garantir l'indépendance et la liberté des médias et de la communication conformément à la loi",
        "Étudier les demandes d'exploitation de stations et sociétés de radiodiffusion audiovisuelle",
        "Garantir le respect des cahiers des charges des radios et télévisions publiques, privées et associatives",
        "Contribuer au respect des normes relatives aux équipements de diffusion et de réception des programmes de radio et de télévision",
        "Veiller au respect des principes d'unité nationale, de sécurité et d'ordre public, d'objectivité et d'équilibre dans le traitement des nouvelles",
        "Veiller au respect de l'accès équitable des partis politiques, syndicats et organisations de la société civile aux médias publics",
        "Encourager et promouvoir une concurrence saine entre les médias publics et privés",
        "Contribuer à l'autorégulation du secteur de la presse et de l'édition"
      ],
      backToTop: t('backToTop')
    },
    ar: {
      title: "مهمة الهابا",
      subtitle: "مهمتنا ورؤيتنا",
      aboutUs: t('hapaAbout'),
      aboutContent: `أنشأت السلطة العليا للصحافة والسمعيات البصرية بموجب الأمر القانوني رقم: 034-2006 الصادر بتاريخ 20 أكتوبر 2006.

وهي هيئة مؤسسية مستقلة، تعنى بضبط وتطوير المشهد الإعلامي الوطني؛ بغية التمكين لقيم العمل الصحفي المهني، انطلاقا من مدونة قانونية محكمة، واستئناسا بمرجعية تشريعية واضحة، تسعى إلى تأمين وتحصين حرية التعبير وتجسيدها مكسبا وطنيا وخيارا استراتيجيا أساسيا؛ يشكل ركيزة محورية للممارسة الديمقراطية.

والسلطة العليا للصحافة والسمعيات البصرية هي الهيئة المسؤولة عن ضبط ورقابة قطاع الاتصال من خلال السهر على تطبيق التشريعات والنظم المتعلقة بالصحافة والاتصال السمعي البصري والإعلام الرقمي.

وقد نصت المادة الثانية من هذا القانون على أنه: "يتم إنشاء سلطة إدارية مستقلة لتنظيم الصحافة والسمعيات البصرية لدى رئيس الجمهورية تدعى السلطة العليا للصحافة والسمعيات البصرية اختصارا "السلطة العليا" يوجد مقرها بنواكشوط، وتتمتع بالشخصية الاعتبارية وبالاستقلالية المالية".`,
      missionsTitle: t('missionAndResponsibilities'),
      missions: [
        "السهر على تطبيق التشريع والنظم المتعلقة بالصحافة والاتصال السمعي البصري والإعلام الرقمي وذلك في ظروف غير تمييزية تضمن الإنصاف والموضوعية والشفافية",
        "الإسهام في ضمان احترام أخلاقيات المهنة من قبل الشركات والمؤسسات الإذاعية والتلفزيونية الخصوصية والعمومية والجمعوية، ومن طرف الصحف والنشرات الدورية العمومية والخصوصية",
        "ضمان استقلالية وحرية الإعلام والاتصال وفقا للقانون",
        "دراسة طلبات استغلال محطات وشركات البث السمعي البصري طبقا لأحكام المادة 23 من القانون المتعلق بالاتصال السمعي البصري وتقديم رأي بالموافقة أو عدم الموافقة على منح أو رفض أو تجديد أو سحب الرخص والأذون",
        "ضمان احترام دفاتر الشروط الخاصة بالإذاعات والتلفزيونات العمومية والخصوصية والجمعوية",
        "الإسهام في احترام المعايير المتعلقة بمعدات بث واستقبال البرامج الإذاعية والتلفزيونية",
        "السهر - في إطار احترام القانون والمحافظة على الهوية الثقافية - على احترام مبادئ وأسس الوحدة الوطنية والأمن والنظام العموميين، والموضوعية، ومراعاة التوازن في معالجة الأخبار المنشورة",
        "السهر على احترام النفاذ العادل للأحزاب السياسية والنقابات ومنظمات المجتمع المدني المعترف بها إلى وسائل الإعلام العمومية حسب الشروط التي تحددها القوانين والنظم",
        "السهر على احترام القوانين والنظم وحرية الآخر وملكيته والقيم الإسلامية وكرامة الإنسان والطابع التعددي للتعبير عن اتجاهات الرأي والفكر والهوية الثقافية وحماية الطفولة والمراهقة",
        "تحديد قواعد إنتاج وبرمجة وبث البرامج المتعلقة بالحملات الانتخابية",
        "تشجيع وترقية التنافس السليم بين وسائل الإعلام العمومية والخصوصية، المكتوبة والسمعية البصرية والرقمية",
        "الإسهام في التنظيم الذاتي لقطاع الصحافة والنشر",
        "وضع مدونة لأخلاقيات المهنة لصالح مهنيي الاتصال",
        "السهر على احترام المعايير المهنية وإصدار اللوائح التوجيهية المتعلقة باحترام قواعدها وأخلاقياتها",
        "ممارسة التحكيم في النزاعات الداخلية بين المهنيين والأطراف الأخرى، وممارسة الوساطة بين المهنيين ومشغليهم",
        "متابعة مساطر التأديب التي تهم المؤسسات الصحفية والصحفيين المهنيين والمدونين",
        "إبداء الرأي بشأن محتويات النصوص المنظمة للصحافة المهنية وللإعلام الرقمي",
        "اقتراح الإجراءات وإعداد الدراسات التي من شأنها تطوير قطاع الصحافة والنشر وتطوير أدائه",
        "الإسهام في تفعيل آليات التشاور والتشارك والتعاون بين مكونات الفضاء الإعلامي",
        "الإسهام في إعداد الدراسات والبرامج التنفيذية المرتبطة بالتمهين والتخصص وبتطوير الممارسة الإعلامية",
        "تطوير شراكات مع الهيئات الوطنية والدولية ذات الصلة بالفضاء الإعلامي",
        "الإسهام في وضع الأطر الفنية والضبطية والمهنية الممكنة لكافة المواطنين من ممارسة حقهم في الإعلام بحرية",
        "العمل على الارتقاء بالممارسة الإعلامية بما يضمن جودة المنتج وصدقية الوقائع المتداولة عبر كافة وسائل الإعلام",
        "الإسهام في وضع مكونة للضبط والتنظيم ضمن الاستراتيجيات والخطط الوطنية الهادفة إلى تكوين رأي عام حاضن لقيم الحرية",
        "الإسهام في وضع النظم المهنية الأساسية لقطاعات الصحافة والنشر والتدوين",
        "دعم كافة الأطر المؤسسية والنقابية الممكنة للصحفيين المهنيين",
        "المساهمة في تفعيل الاتفاقيات الدولية المتعلقة بحماية الصحفيين وبالحفاظ على حقوقهم المهنية",
        "الإسهام في وضع آليات عمل القطب الإعلامي الجمعوي",
        "الإسهام في منح الاستشارة في مجال الدعم العمومي للصحافة",
        "ضمان استقلال المؤسسات الصحفية والإعلامية، وحيادها، وتعددها، وتنوعها بشكل متوازن",
        "ممارسة النشاط الاقتصادي في مجالي الصحافة والإعلام على نحو لا يؤدى إلى منع حرية المنافسة أو تقييدها"
      ],
      backToTop: t('backToTop')
    }
  }
  
  const content = missionData[locale as keyof typeof missionData]
  
  return (
    <article className="min-h-screen pb-24" >
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-accent to-primary text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-32 h-32 border-2 border-white rounded-full"></div>
          <div className="absolute top-40 right-32 w-24 h-24 border-2 border-secondary rounded-full"></div>
          <div className="absolute bottom-32 left-1/4 w-16 h-16 bg-secondary/20 rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-20 h-20 border-2 border-white/50 rounded-full"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                {content.title}
              </h1>
              <div className="w-32 h-1 bg-secondary mx-auto"></div>
              <p className="text-xl md:text-2xl text-white/90 font-light max-w-3xl mx-auto">
                {content.subtitle}
              </p>
            </div>
            
            {/* Mission Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <svg className="w-12 h-12 text-secondary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L3.09 8.26L4 21H20L20.91 8.26L12 2ZM18.5 19H5.5L4.84 9.24L12 4.5L19.16 9.24L18.5 19ZM8.5 12.5L10 14L15.5 8.5L14 7L10 11L9 10L8.5 12.5Z"/>
                  </svg>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-secondary rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        
      </section>

      {/* About Us Section */}
      <section className="relative bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  {content.aboutUs}
                </h2>
                <div className="w-20 h-1 bg-primary"></div>
              </div>
              
              <div className="prose prose-lg prose-gray max-w-none">
                <div className="text-gray-700 leading-relaxed space-y-6">
                  {content.aboutContent.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-justify">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Visual Element */}
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 flex items-center justify-center">
                <div className="text-center space-y-6">
                  <div className="w-32 h-32 bg-primary rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM17 12H15V10H17V12ZM17 16H15V14H17V16ZM11 12H9V10H11V12ZM11 16H9V14H11V16ZM7 12H5V10H7V12ZM7 16H5V14H7V16Z"/>
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-primary">2006</h3>
                    <p className="text-gray-600 text-sm">
                      {t('establishedYear')}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-secondary/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-primary/10 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Missions Section */}
      <section className="relative bg-gray-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8 mb-16">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                {content.missionsTitle}
              </h2>
              <div className="w-32 h-1 bg-primary mx-auto"></div>
            </div>
          </div>
          
          {/* Missions Grid */}
          <div className="grid gap-6 md:gap-8">
            {content.missions.map((mission, index) => (
              <div
                key={index}
                className="group bg-white rounded-xl p-6 md:p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-primary/20"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold group-hover:bg-accent transition-colors duration-300">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 leading-relaxed text-justify">
                      {mission}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="relative bg-primary text-white py-16">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-2xl md:text-3xl font-bold">
            {locale === 'ar' 
              ? 'نعمل معًا لتطوير المشهد الإعلامي الوطني' 
              : 'Œuvrons ensemble pour développer le paysage médiatique national'
            }
          </h2>
          <div className="flex justify-center">
            <div className="w-24 h-1 bg-secondary"></div>
          </div>
        </div>
      </section>

      {/* Back to Top Button - Client Component */}
      <BackToTopButton label={content.backToTop} />
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { locale } = await paramsPromise
  
  const titles = {
    fr: "Mission HAPA - Haute Autorité de la Presse et de l'Audiovisuel",
    ar: "مهمة الهابا - السلطة العليا للصحافة والسمعيات البصرية"
  }
  
  const descriptions = {
    fr: "Découvrez la mission et les compétences de la Haute Autorité de la Presse et de l'Audiovisuel de Mauritanie dans la régulation du paysage médiatique national.",
    ar: "تعرف على مهمة وصلاحيات السلطة العليا للصحافة والسمعيات البصرية في موريتانيا في ضبط المشهد الإعلامي الوطني."
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