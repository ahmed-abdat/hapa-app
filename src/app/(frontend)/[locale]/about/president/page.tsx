import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { generateMeta } from '@/utilities/generateMeta'
import { getLocaleDirection, type Locale } from '@/utilities/locale'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import BackToTopButton from './BackToTopButton'

type Args = {
  params: Promise<{
    locale: string
  }>
}

export default async function PresidentPage({ params: paramsPromise }: Args) {
  const { locale } = await paramsPromise
  
  if (locale !== 'fr' && locale !== 'ar') {
    notFound()
  }
  
  const direction = getLocaleDirection(locale as Locale)
  const t = await getTranslations()
  
  const presidentData = {
    fr: {
      title: t('presidentMessage'),
      name: t('presidentName'),
      position: t('presidentTitle'),
      content: `La Haute Autorité de la Presse et de l'Audiovisuel œuvre à l'accomplissement de ses missions dans la régulation et le développement du paysage médiatique national, en garantissant la liberté de communication audiovisuelle et l'expression des courants de pensée et d'opinion dans le respect des valeurs civilisationnelles et des constantes nationales et des lois de référence de la République, dans le but d'assurer le droit du citoyen à l'information.

Et œuvrant à sécuriser et professionnaliser la liberté d'expression et à l'incarner comme acquis national et choix stratégique fondamental, constituant un pilier central de la pratique démocratique et un levier puissant pour le développement, à travers la veille à l'application des législations et systèmes relatifs à la presse et à la communication audiovisuelle et aux médias numériques, et le renforcement de la régulation et du contrôle des contenus médiatiques.

L'Autorité Supérieure veille dans ce contexte à consacrer les libertés et l'engagement aux principes d'éthique, de responsabilité et de professionnalisme, et travaille de manière indépendante avec les acteurs médiatiques privés, publics et associatifs pour permettre à tous les citoyens d'exercer leur droit à l'information, et à sécuriser l'accès à des services d'information pluralistes et compétitifs répondant aux aspirations d'une opinion publique nationale qui s'est positionnée dans l'action médiatique à travers des moyens et supports qui évoluent à un rythme accéléré.`,
      readMore: t('readMore'),
      backToTop: t('backToTop')
    },
    ar: {
      title: t('presidentMessage'),
      name: t('presidentName'),
      position: t('presidentTitle'),
      content: `تعمل السلطة العليا للصحافة والسمعيات البصرية على أداء مهامها في ضبط وتطوير المشهد الإعلامي الوطني، وضمان حرية الاتصال السمعي البصري، والتعبير عن تيارات الفكر والرأي في إطار احترام القيم الحضارية والثوابت الوطنية والقوانين المرجعية للجمهورية، بغية ضمان حق المواطن في المعلومة.

وعملا على تأمين وتمهين حرية التعبير وتجسيدها مكسبا وطنيا وخيارا استراتيجيا أساسيا، يشكل ركيزة محورية للممارسة الديمقراطية ورافعة قوية للتنمية، من خلال السهر على تطبيق التشريعات والنظم المتعلقة بالصحافة والاتصال السمعي البصري والإعلام الرقمي، وتعزيز ضبط ورقابة المضامين الإعلامية.

وتسهر السلطة العليا في هذا السياق على تكريس الحريات والالتزام بمبادئ الأخلاق والمسؤولية والمهنية، وتعمل باستقلالية مع الفاعلين الإعلاميين الخصوصيين والعموميين والجمعويين على تمكين كافة المواطنين من ممارسة حقهم في الإعلام، وعلى تأمين النفاذ والولوج لخدمات إعلامية تعددية تنافسية ملبية لتطلعات رأي عام وطني أصبح في موقع الفعل الإعلامي عبر وسائل ووسائط تتطور بوتيرة متسارعة.

وقد وضع القانون رقم 26-2008 بتاريخ 06 مايو 2008 الذي يلغى ويحل محل الأمر القانوني رقم 034-2006 المنشئ للسلطة العليا للصحافة والسمعيات البصرية المبادئ الأساسية للضبط، مانحا السلطة العليا صلاحيات في مجالات من أهمها:

- السهر على تطبيق التشريع والنظم المتعلقة بالصحافة والاتصال السمعي البصري في ظروف موضوعية وشفافة وغير تمييزية، فضلا عن ضبط ورقابة مضامين ومحتويات النشر في الصحافة الورقية والرقمية ووسائل التواصل الاجتماعي؛
- ضمان الاستقلالية وعدم التحيز في وسائل الإعلام والاتصال العمومية والمصادقة على تعيين المديرين العامين لها؛
- تشجيع وترقية التنافس السليم بين وسائل الإعلام العمومية والخصوصية المكتوبة والسمعية البصرية، إضافة إلى الوسائط الإلكترونية ووسائل التواصل الاجتماعي في سياق الصلاحيات الموسعة للسلطة العليا بموجب القانون 022-2022؛
- السهر على ولوج كافة الفاعلين لوسائل الإعلام العمومية والخصوصية المكتوبة والسمعية البصرية؛
- دراسة ملفات طلبات ترخيص المحطات الإذاعية والتلفزيونية؛
- السهر على احترام القوانين والنظم وحرية الآخر وملكيته والقيم الإسلامية وكرامة الإنسان والطابع التعددي للتعبير والفكر والهوية الثقافية وحماية الطفولة والمراهقة في البرامج السمعية البصرية؛
- السهر على احترام الوحدة الوطنية وصيانة اللحمة الاجتماعية؛

كما عزز القانون رقم 26-2008 موقع السلطة العليا للصحافة والسمعيات البصرية من خلال ربطها برئاسة الجمهورية، واتسعت مجالات عملها بصدور القانون رقم 045-2010 الخاص بتحرير الفضاء السمعي البصري الذي منح السلطة العليا دورا أساسيا في مجال منح الرخص لاستغلال الإذاعات والتلفزيونات الخصوصية والجمعوية، وأعطاها صلاحيات مهنية واسعة في مجال وضع ورقابة وتنفيذ دفاتر الشروط والالتزامات.

وشكل القانون رقم 022-2022 إضافة نوعية لمهام الهيئة وتوسيعا لصلاحياتها لتشمل ضبط الإعلام الجديد: الإعلام الرقمي وإعلام التواصل الاجتماعي، وضبط المؤسسات والأفراد الممارسين بكل المجالات الإعلامية المكتوبة؛ الرقمية التقليدية والجديدة، فضلا عن الاضطلاع بدور التحكيم والوساطة بين الفاعلين في الحقل الإعلامي مهنيين ومشغلين.

ويؤشر توسع مهام السلطة العليا وتعزيز صلاحياتها القانونية في ضبط المشهد الإعلامي الوطني على أهمية دورها، بوصفها إحدى ركائز النظام الديمقراطي التعددي الذي يتعزز باستمرار في شتى مناحي الحياة الوطنية.

وتجسيدا لهذه الأهمية وترجمة لدور السلطة في مواكبة المشهد الإعلامي الوطني، تسعى إلى تعزيز فضاء الحريات وتفعيل آليات الرصد والضبط ومراقبة المضامين لمواءمتها مع الالتزامات القانونية والأخلاقيات المهنية، فضلا عن تطوير وتحسين خبرات الصحفيين عبر تنظيم الدورات التكوينية في مختلف الأجناس الصحفية، ومواكبة الصحفيين والمدونين ومستخدمي التواصل الاجتماعي، من أجل توطيد قيم المهنية والمسؤولية والاستقلالية والشفافية.

كما تعمل على إعداد التحقيقات والدراسات الشاملة حول واقع المشهد الإعلامي، وتحقيقات التعددية الدورية حول مستوى نفاذ الفاعلين السياسيين والمجتمعيين، وحضور النوع في المساطر البرامجية، ومواكبة وضبط الحملات الدعائية في المواسم الانتخابية والفترات العادية، وتفعيل آليات الوساطة والتحكيم، انطلاقا من المهام الضبطية والصلاحيات الموكلة إلى السلطة العليا في هذا المجال.

والسلطة العليا للصحافة والسمعيات البصرية عضو فاعل في العديد من الهيئات الضبطية الإقليمية والقارية والدولية، وتعمل باطراد على تعميق العلاقات وتعزيز الشراكات مع نظيراتها في المنطقة وعلى المستوى الدولي، من خلال تبادل الخبرات والتجارب وتعزيز آليات التشاور وآفاق التعاون في جميع المجالات المرتبطة بمهامها في ضبط وتطوير المشهد الإعلامي الوطني.

وسيتم العمل في المرحلة القادمة على تعزيز المكاسب وتدعيمها، واستشراف الآفاق المرتبطة بتوطيدها، والتطلع إلى كسب وتحقيق الرهانات المتعددة على المستويات المؤسسية والقانونية والاجتماعية والاقتصادية، سبيلا إلى التمهين والتمكين لقيم العمل الصحفي الناضج، وترسيخ مبادئ التعددية والحرية والمهنية، عبر الشراكة البناءة والتعاون المثمر مع مختلف الفاعلين والمهنيين والشركاء في حقل الاتصال والإعلام.`,
      readMore: t('readMore'),
      backToTop: t('backToTop')
    }
  }
  
  const content = presidentData[locale as keyof typeof presidentData]
  
  return (
    <article className="min-h-screen pb-24" dir={direction}>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary to-accent text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            {/* Text Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                  {content.title}
                </h1>
                <div className="w-24 h-1 bg-secondary"></div>
              </div>
              
              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-semibold text-secondary">
                  {content.name}
                </h2>
                <p className="text-base md:text-lg text-white/90 leading-relaxed">
                  {content.position}
                </p>
              </div>
            </div>
            
            {/* President Image */}
            <div className="relative">
              <div className="aspect-[3/4] sm:aspect-square relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 max-w-sm sm:max-w-md lg:max-w-lg mx-auto">
                <Image
                  src="/president-image.jpg"
                  alt={content.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 640px) 80vw, (max-width: 768px) 60vw, 50vw"
                />
              </div>
              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-secondary/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>
        
      </section>

      {/* Main Content */}
      <section className="relative bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="prose prose-lg prose-primary max-w-none">
            <div className="text-gray-700 leading-relaxed space-y-6 text-base md:text-lg">
              {content.content.split('\n\n').map((paragraph, index) => {
                if (paragraph.trim().startsWith('-')) {
                  // Handle bullet points
                  const bulletPoints = paragraph.split('\n').filter(line => line.trim().startsWith('-'))
                  return (
                    <ul key={index} className="space-y-3 my-8">
                      {bulletPoints.map((point, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="inline-block w-2 h-2 bg-primary rounded-full mt-3 flex-shrink-0"></span>
                          <span>{point.replace(/^-\s*/, '')}</span>
                        </li>
                      ))}
                    </ul>
                  )
                }
                return (
                  <p key={index} className="text-justify">
                    {paragraph}
                  </p>
                )
              })}
            </div>
            
            {/* Signature */}
            <div className="mt-16 pt-8 border-t border-gray-200">
              <div className="text-center">
                <p className="text-xl font-semibold text-primary mb-2">
                  {content.name}
                </p>
                <p className="text-gray-600">
                  {content.position}
                </p>
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
    fr: "Mot du Président - HAPA",
    ar: "كلمة الرئيس - الهابا"
  }
  
  const descriptions = {
    fr: "Message du Président de la Haute Autorité de la Presse et de l'Audiovisuel de Mauritanie",
    ar: "رسالة رئيس السلطة العليا للصحافة والسمعيات البصرية في موريتانيا"
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